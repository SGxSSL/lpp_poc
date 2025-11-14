# app/services/transcription_analyzer_gemini.py
import os
import json
import asyncio
import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.unstructured_analysis import UnstructuredAnalysis
from app.services.transcript_metrics_calculator import calculate_transcript_metrics
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Model
model = genai.GenerativeModel("gemini-2.5-flash")


def parse_json_response(text: str) -> dict:
    """Clean and parse JSON response from Gemini."""
    text = text.strip()
    
    # 🧹 Clean Markdown formatting if model adds code fences
    if text.startswith("```"):
        text = text.strip("`")
        text = text.replace("json", "").strip()
    
    # 🧩 Parse safely
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.error(f"❌ Invalid JSON from model: {text[:300]}")
        raise ValueError(f"Invalid JSON from model output: {text[:300]}")


async def analyze_sentiment_and_intent(transcript: str) -> dict:
    """
    Call 1: Analyze sentiment, tone, intent, and conversion probability.
    """
    prompt = f"""
    You are an AI analyzing loan sales call transcripts.
    Analyze ONLY the sentiment, tone, intent, and conversion aspects.
    
    Return JSON with these fields:
    {{
      "sentiment": "positive/negative/neutral",
      "tone": "professional/casual/aggressive/friendly",
      "intent_type": "inquiry/application/complaint/followup",
      "intent_strength": "strong/moderate/weak",
      "decision_stage": "awareness/consideration/decision/action",
      "conversion_probability": 0-100,
      "summary_ai": "Brief 2-3 sentence summary of the call",
      "outcome_classification": "Resolved/Escalated/Unresolved"
    }}
    
    Rules:
    - Return pure JSON — no markdown or ```json``` wrappers.
    - Be concise and accurate.
    - If unsure, use null.
    
    TRANSCRIPT:
    {transcript}
    """
    
    response = model.generate_content(prompt)
    return parse_json_response(response.text)


async def analyze_semantic_and_discourse(transcript: str) -> dict:
    """
    Call 2: Analyze semantic content and discourse (LLM-only aspects).
    Note: Keywords, deception_markers, entity_mentions are calculated separately without LLM.
    """
    prompt = f"""
    You are an AI analyzing loan sales call transcripts.
    Analyze ONLY the semantic content and discourse structure.
    
    Return JSON with these fields:
    {{
      "topics_discussed": ["topic1", "topic2"],
      "speech_acts": ["request", "confirmation", "offer", "rejection"],
      "discourse_relations": ["Turn X elaborates on Turn Y"],
      "framing_style": "benefit emphasis/urgency framing/neutral/problem-focused",
      "themes": ["main theme 1", "main theme 2"],
      "highlights": ["Turn X: significant event"]
    }}
    
    Rules:
    - Return pure JSON — no markdown or ```json``` wrappers.
    - Identify key topics and themes.
    - Note significant moments in the conversation.
    
    TRANSCRIPT:
    {transcript}
    """
    
    response = model.generate_content(prompt)
    return parse_json_response(response.text)


async def analyze_emotional_metrics(transcript: str) -> dict:
    """
    Call 3: Analyze emotional and psychological aspects.
    """
    prompt = f"""
    You are an AI analyzing loan sales call transcripts.
    Analyze ONLY the emotional and psychological aspects.
    
    Return JSON with these fields:
    {{
      "pain_points": "Customer's main concerns or problems",
      "objections": "Customer's objections or hesitations",
      "clarity_score": 0-10,
      "trust_score": 0-10,
      "emotion_profile": {{"emotion_name": 0.0-1.0}},
      "dominant_emotion": "primary emotion detected",
      "empathy_score": 0-10,
      "politeness_level": 0-10,
      "formality_level": 0-10
    }}
    
    Rules:
    - Return pure JSON — no markdown or ```json``` wrappers.
    - Scores are 0-10, emotion values are 0.0-1.0.
    - Be objective in assessment.
    
    TRANSCRIPT:
    {transcript}
    """
    
    response = model.generate_content(prompt)
    return parse_json_response(response.text)


async def analyze_conversation_structure(transcript: str) -> dict:
    """
    Call 4: Analyze conversation flow and structure (LLM-only aspects).
    Note: talk_ratio, dominance_score, interruptions, conversation_phases are calculated separately without LLM.
    """
    prompt = f"""
    You are an AI analyzing loan sales call transcripts.
    Analyze ONLY the conversation structure and dynamics.
    
    Return JSON with these fields:
    {{
      "next_actions": "Recommended next steps",
      "followup_priority": "Low/Medium/High",
      "cooperation_index": 0.0-1.0,
      "response_latency": 0.0,
      "confidence": 0.0-1.0
    }}
    
    Rules:
    - Return pure JSON — no markdown or ```json``` wrappers.
    - Estimate metrics based on conversation flow.
    - Confidence reflects overall analysis certainty.
    
    TRANSCRIPT:
    {transcript}
    """
    
    response = model.generate_content(prompt)
    return parse_json_response(response.text)


async def analyze_transcription_gemini(call_id: int, transcript: str, db: AsyncSession):
    """
    Analyze a call transcription using a hybrid approach:
    - Non-LLM metrics calculated locally (keywords, talk ratio, etc.)
    - LLM calls for complex analysis (sentiment, intent, emotions)
    
    This reduces LLM API calls and costs while maintaining accuracy.
    """
    logger.info(f"🚀 Starting hybrid analysis for call_id={call_id}")
    
    # ⚡ Step 1: Calculate non-LLM metrics locally (fast, free)
    logger.info("📊 Calculating non-LLM metrics...")
    non_llm_metrics = calculate_transcript_metrics(transcript)
    
    # 🤖 Step 2: Execute LLM analysis calls in parallel (only what needs AI)
    try:
        results = await asyncio.gather(
            analyze_sentiment_and_intent(transcript),
            analyze_semantic_and_discourse(transcript),
            analyze_emotional_metrics(transcript),
            analyze_conversation_structure(transcript),
            return_exceptions=True
        )
        
        # Check for exceptions
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ Analysis call {i+1} failed: {str(result)}")
                raise result
        
        # Unpack results
        sentiment_data, semantic_data, emotional_data, structure_data = results
        
        logger.info("✅ All 4 Gemini calls completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Multi-call analysis failed: {str(e)}")
        raise
    
    # 🔗 Step 3: Combine LLM results with non-LLM metrics
    analysis = UnstructuredAnalysis(
        call_id=call_id,
        model_name="gemini-2.5-flash-hybrid",
        
        # From sentiment_and_intent (LLM)
        sentiment=sentiment_data.get("sentiment"),
        tone=sentiment_data.get("tone"),
        intent_type=sentiment_data.get("intent_type"),
        intent_strength=sentiment_data.get("intent_strength"),
        decision_stage=sentiment_data.get("decision_stage"),
        conversion_probability=sentiment_data.get("conversion_probability"),
        summary_ai=sentiment_data.get("summary_ai"),
        outcome_classification=sentiment_data.get("outcome_classification"),
        
        # From semantic_and_discourse (mixed)
        keywords=non_llm_metrics.get("keywords"),  # ⚡ Non-LLM
        topics_discussed=semantic_data.get("topics_discussed"),  # 🤖 LLM
        entity_mentions=non_llm_metrics.get("entity_mentions"),  # ⚡ Non-LLM
        speech_acts=semantic_data.get("speech_acts"),  # 🤖 LLM
        discourse_relations=semantic_data.get("discourse_relations"),  # 🤖 LLM
        framing_style=semantic_data.get("framing_style"),  # 🤖 LLM
        deception_markers=non_llm_metrics.get("deception_markers"),  # ⚡ Non-LLM
        themes=semantic_data.get("themes"),  # 🤖 LLM
        highlights=semantic_data.get("highlights"),  # 🤖 LLM
        
        # From emotional_metrics (LLM)
        pain_points=emotional_data.get("pain_points"),
        objections=emotional_data.get("objections"),
        clarity_score=emotional_data.get("clarity_score"),
        trust_score=emotional_data.get("trust_score"),
        emotion_profile=emotional_data.get("emotion_profile"),
        dominant_emotion=emotional_data.get("dominant_emotion"),
        empathy_score=emotional_data.get("empathy_score"),
        politeness_level=non_llm_metrics.get("politeness_level"),  # ⚡ Non-LLM
        formality_level=non_llm_metrics.get("formality_level"),  # ⚡ Non-LLM
        
        # From conversation_structure (mixed)
        next_actions=structure_data.get("next_actions"),  # 🤖 LLM
        followup_priority=structure_data.get("followup_priority"),  # 🤖 LLM
        conversation_phases=non_llm_metrics.get("conversation_phases"),  # ⚡ Non-LLM
        cooperation_index=structure_data.get("cooperation_index"),  # 🤖 LLM
        dominance_score=non_llm_metrics.get("dominance_score"),  # ⚡ Non-LLM
        talk_ratio=non_llm_metrics.get("talk_ratio"),  # ⚡ Non-LLM
        interruptions=non_llm_metrics.get("interruptions"),  # ⚡ Non-LLM
        response_latency=structure_data.get("response_latency"),  # 🤖 LLM
        confidence=structure_data.get("confidence"),  # 🤖 LLM
    )

    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    logger.info(f"✅ Saved hybrid analysis for call_id={call_id} (LLM + non-LLM metrics)")
    return analysis
