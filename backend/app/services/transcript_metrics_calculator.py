# app/services/transcript_metrics_calculator.py
"""
Calculate transcript metrics without LLM calls.
These metrics can be computed using traditional NLP and pattern matching.
"""
import re
from collections import Counter
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class TranscriptMetricsCalculator:
    """Calculate various metrics from transcripts without using LLM."""
    
    # Hedge words that indicate uncertainty/deception
    HEDGE_WORDS = [
        'maybe', 'perhaps', 'possibly', 'probably', 'might', 'could',
        'i think', 'i believe', 'i guess', 'kind of', 'sort of',
        'actually', 'basically', 'honestly', 'literally', 'just'
    ]
    
    # Polite phrases
    POLITE_PHRASES = [
        'please', 'thank you', 'thanks', 'appreciate', 'excuse me',
        'pardon', 'sorry', 'apologize', 'would you mind', 'if you don\'t mind'
    ]
    
    # Formal words
    FORMAL_WORDS = [
        'regarding', 'furthermore', 'therefore', 'however', 'nonetheless',
        'moreover', 'consequently', 'accordingly', 'subsequently', 'hereby'
    ]
    
    # Common stop words to exclude from keyword extraction
    STOP_WORDS = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'
    }
    
    # Conversation phase markers
    PHASE_MARKERS = {
        'greeting': ['hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'how are you'],
        'needs_assessment': ['what', 'why', 'how', 'when', 'tell me', 'explain', 'describe'],
        'objection': ['but', 'however', 'concern', 'worried', 'not sure', 'hesitant'],
        'closing': ['thank you', 'thanks', 'goodbye', 'bye', 'have a nice', 'take care']
    }
    
    def __init__(self, transcript: str):
        """Initialize with a transcript."""
        self.transcript = transcript.lower()
        self.original_transcript = transcript
        self.lines = self._parse_transcript()
        
    def _parse_transcript(self) -> List[Dict]:
        """
        Parse transcript into structured format.
        Assumes format like: "Agent: text" or "Customer: text"
        """
        lines = []
        for line in self.original_transcript.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            # Try to detect speaker
            speaker_match = re.match(r'^(Agent|Customer|Officer|Client|Caller):\s*(.+)', line, re.IGNORECASE)
            if speaker_match:
                speaker = speaker_match.group(1).lower()
                text = speaker_match.group(2).strip()
                lines.append({
                    'speaker': 'agent' if speaker in ['agent', 'officer'] else 'customer',
                    'text': text,
                    'text_lower': text.lower()
                })
            else:
                # No speaker label, treat as continuation
                if lines:
                    lines[-1]['text'] += ' ' + line
                    lines[-1]['text_lower'] += ' ' + line.lower()
                else:
                    lines.append({
                        'speaker': 'unknown',
                        'text': line,
                        'text_lower': line.lower()
                    })
        
        return lines
    
    def calculate_keywords(self, top_n: int = 10) -> List[Dict]:
        """
        Extract top keywords with frequency (no sentiment context).
        Returns list of {keyword, frequency}
        """
        # Tokenize
        words = re.findall(r'\b[a-z]{3,}\b', self.transcript)
        
        # Filter stop words
        filtered_words = [w for w in words if w not in self.STOP_WORDS]
        
        # Count frequencies
        word_counts = Counter(filtered_words)
        
        # Get top N
        top_keywords = word_counts.most_common(top_n)
        
        return [
            {
                'keyword': word,
                'frequency': count,
                'sentiment_context': None  # Would need LLM or sentiment lexicon
            }
            for word, count in top_keywords
        ]
    
    def calculate_deception_markers(self) -> Dict[str, int]:
        """
        Count hedge words and uncertainty markers.
        Returns dict of {word: frequency}
        """
        markers = {}
        for hedge in self.HEDGE_WORDS:
            count = len(re.findall(r'\b' + re.escape(hedge) + r'\b', self.transcript))
            if count > 0:
                markers[hedge] = count
        
        return markers
    
    def calculate_talk_ratio(self) -> Dict[str, float]:
        """
        Calculate talk ratio between agent and customer.
        Returns {agent: 0.0-1.0, customer: 0.0-1.0}
        """
        agent_words = 0
        customer_words = 0
        
        for line in self.lines:
            word_count = len(line['text'].split())
            if line['speaker'] == 'agent':
                agent_words += word_count
            elif line['speaker'] == 'customer':
                customer_words += word_count
        
        total_words = agent_words + customer_words
        
        if total_words == 0:
            return {'agent': 0.5, 'customer': 0.5}
        
        return {
            'agent': round(agent_words / total_words, 2),
            'customer': round(customer_words / total_words, 2)
        }
    
    def calculate_dominance_score(self) -> Dict[str, int]:
        """
        Calculate speaking dominance (percentage of conversation).
        Returns {agent: 0-100, customer: 0-100}
        """
        talk_ratio = self.calculate_talk_ratio()
        return {
            'agent': int(talk_ratio['agent'] * 100),
            'customer': int(talk_ratio['customer'] * 100)
        }
    
    def count_interruptions(self) -> int:
        """
        Count potential interruptions (consecutive same-speaker turns are rare).
        Simple heuristic: count speaker switches within short text.
        """
        interruptions = 0
        
        for i in range(len(self.lines) - 1):
            current_speaker = self.lines[i]['speaker']
            next_speaker = self.lines[i + 1]['speaker']
            
            # If speaker switches and current line is very short (< 5 words)
            # it might be an interruption
            if current_speaker != next_speaker:
                word_count = len(self.lines[i]['text'].split())
                if word_count < 5 and word_count > 0:
                    interruptions += 1
        
        return interruptions
    
    def calculate_politeness_level(self) -> float:
        """
        Calculate politeness score 0-10 based on polite phrases.
        """
        polite_count = 0
        for phrase in self.POLITE_PHRASES:
            polite_count += len(re.findall(r'\b' + re.escape(phrase) + r'\b', self.transcript))
        
        # Normalize by transcript length (per 100 words)
        word_count = len(self.transcript.split())
        if word_count == 0:
            return 5.0
        
        # Scale: 0 polite phrases = 3.0, 5+ per 100 words = 10.0
        normalized = (polite_count / word_count) * 100
        score = min(3.0 + normalized * 2, 10.0)
        
        return round(score, 1)
    
    def calculate_formality_level(self) -> float:
        """
        Calculate formality score 0-10 based on formal words.
        """
        formal_count = 0
        for word in self.FORMAL_WORDS:
            formal_count += len(re.findall(r'\b' + re.escape(word) + r'\b', self.transcript))
        
        # Normalize by transcript length (per 100 words)
        word_count = len(self.transcript.split())
        if word_count == 0:
            return 5.0
        
        # Scale: 0 formal words = 2.0, 3+ per 100 words = 10.0
        normalized = (formal_count / word_count) * 100
        score = min(2.0 + normalized * 3, 10.0)
        
        return round(score, 1)
    
    def extract_entity_mentions(self) -> Dict:
        """
        Extract basic entities using regex patterns.
        Returns dict with product, date, amount mentions.
        """
        entities = {
            'product': [],
            'date': [],
            'amount': []
        }
        
        # Extract monetary amounts
        amounts = re.findall(r'\$[\d,]+(?:\.\d{2})?|\b\d+\s*(?:dollars|rupees|euros)\b', 
                            self.original_transcript, re.IGNORECASE)
        entities['amount'] = list(set(amounts))[:5]  # Limit to 5
        
        # Extract dates (simple patterns)
        dates = re.findall(r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,\s+\d{4})?\b',
                          self.original_transcript, re.IGNORECASE)
        entities['date'] = list(set(dates))[:5]
        
        # Extract loan types (basic keywords)
        loan_types = re.findall(r'\b(personal loan|home loan|auto loan|mortgage|car loan|student loan|business loan)\b',
                               self.transcript)
        entities['product'] = list(set(loan_types))[:5]
        
        return entities
    
    def detect_conversation_phases(self) -> List[str]:
        """
        Detect conversation phases based on keyword markers.
        Returns ordered list of detected phases.
        """
        phases = []
        
        # Check first few lines for greeting
        if len(self.lines) > 0:
            first_lines = ' '.join([line['text_lower'] for line in self.lines[:3]])
            if any(marker in first_lines for marker in self.PHASE_MARKERS['greeting']):
                phases.append('Greeting')
        
        # Check for question patterns (needs assessment)
        question_count = len(re.findall(r'\?', self.original_transcript))
        if question_count >= 2:
            phases.append('Needs Assessment')
        
        # Check for objection markers
        for line in self.lines:
            if any(marker in line['text_lower'] for marker in self.PHASE_MARKERS['objection']):
                if 'Objection Handling' not in phases:
                    phases.append('Objection Handling')
                break
        
        # Check for solution presentation (loan-related terms)
        if re.search(r'\b(rate|interest|term|payment|approval|qualify)\b', self.transcript):
            phases.append('Solution Presentation')
        
        # Check last few lines for closing
        if len(self.lines) > 0:
            last_lines = ' '.join([line['text_lower'] for line in self.lines[-3:]])
            if any(marker in last_lines for marker in self.PHASE_MARKERS['closing']):
                phases.append('Closing')
        
        return phases if phases else ['General Discussion']
    
    def calculate_all_metrics(self) -> Dict:
        """
        Calculate all non-LLM metrics in one call.
        Returns dict with all computable metrics.
        """
        logger.info("📊 Calculating non-LLM metrics from transcript")
        
        metrics = {
            'keywords': self.calculate_keywords(top_n=10),
            'deception_markers': self.calculate_deception_markers(),
            'talk_ratio': self.calculate_talk_ratio(),
            'dominance_score': self.calculate_dominance_score(),
            'interruptions': self.count_interruptions(),
            'politeness_level': self.calculate_politeness_level(),
            'formality_level': self.calculate_formality_level(),
            'entity_mentions': self.extract_entity_mentions(),
            'conversation_phases': self.detect_conversation_phases(),
        }
        
        logger.info("✅ Non-LLM metrics calculated successfully")
        return metrics


def calculate_transcript_metrics(transcript: str) -> Dict:
    """
    Convenience function to calculate all metrics from a transcript.
    
    Args:
        transcript: The call transcript text
        
    Returns:
        Dict containing all calculated metrics
    """
    calculator = TranscriptMetricsCalculator(transcript)
    return calculator.calculate_all_metrics()
