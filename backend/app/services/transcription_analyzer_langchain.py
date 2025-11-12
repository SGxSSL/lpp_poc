# app/services/transcription_analyzer_gemini.py
import os
import json
import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.unstructured_analysis import UnstructuredAnalysis
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Model
model = genai.GenerativeModel("gemini-2.5-flash")


async def analyze_transcription_gemini(call_id: int, transcript: str, db: AsyncSession):
    """
    Analyze a call transcription using Gemini 2.5 Flash and store results in unstructured_analysis.
    """

    prompt = f"""
    You are an AI conversation intelligence model trained for loan sales calls.
    Analyze the following transcript and output JSON only (no markdown, no commentary).

    Return a JSON with the following fields:

    {{
      "sentiment": "...",
      "tone": "...",
      "intent_type": "...",
      "intent_strength": "...",
      "decision_stage": "...",
      "conversion_probability": 0-100,
      "keywords": [{{"keyword": "...", "frequency": 1, "sentiment_context": "..."}}],
      "topics_discussed": ["..."],
      "entity_mentions": {{"product": "...", "date": "..."}},
      "speech_acts": ["request", "confirmation", "offer"],
      "discourse_relations": ["Turn 5 elaborates on Turn 4"],
      "framing_style": "benefit emphasis / urgency framing / neutral",
      "deception_markers": {{"maybe": 2, "I think": 1}},
      "pain_points": "...",
      "objections": "...",
      "clarity_score": 0-10,
      "trust_score": 0-10,
      "emotion_profile": {{"frustration": 0.3, "curiosity": 0.6}},
      "dominant_emotion": "...",
      "empathy_score": 0-10,
      "politeness_level": 0-10,
      "formality_level": 0-10,
      "next_actions": "...",
      "followup_priority": "Low / Medium / High",
      "summary_ai": "...",
      "outcome_classification": "Resolved / Escalated / Unresolved",
      "highlights": ["Turn 25: escalation event"],
      "themes": ["loan inquiry", "approval delay"],
      "conversation_phases": ["Greeting", "Inquiry", "Resolution"],
      "cooperation_index": 0-1,
      "dominance_score": {{"agent": 70, "customer": 30}},
      "talk_ratio": {{"agent": 0.6, "customer": 0.4}},
      "interruptions": 3,
      "response_latency": 1.8,
      "confidence": 0-1
    }}

    Rules:
    - Return pure JSON — no markdown or ```json``` wrappers.
    - Estimate numeric and probability values logically.
    - If unsure, set null.
    - Be factual and concise.

    TRANSCRIPT:
    {transcript}
    """

    # Generate response
    response = model.generate_content(prompt)
    text = response.text.strip()

    # 🧹 Clean Markdown formatting if model adds code fences
    if text.startswith("```"):
        text = text.strip("`")
        text = text.replace("json", "").strip()

    # 🧩 Parse safely
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.error(f"❌ Invalid JSON from model: {text[:300]}")
        raise ValueError(f"Invalid JSON from model output: {text[:300]}")

    # 🗄️ Save to DB
    analysis = UnstructuredAnalysis(
        call_id=call_id,
        model_name="gemini-2.5-flash",
        sentiment=data.get("sentiment"),
        tone=data.get("tone"),
        intent_type=data.get("intent_type"),
        intent_strength=data.get("intent_strength"),
        decision_stage=data.get("decision_stage"),
        conversion_probability=data.get("conversion_probability"),
        keywords=data.get("keywords"),
        topics_discussed=data.get("topics_discussed"),
        entity_mentions=data.get("entity_mentions"),
        speech_acts=data.get("speech_acts"),
        discourse_relations=data.get("discourse_relations"),
        framing_style=data.get("framing_style"),
        deception_markers=data.get("deception_markers"),
        pain_points=data.get("pain_points"),
        objections=data.get("objections"),
        clarity_score=data.get("clarity_score"),
        trust_score=data.get("trust_score"),
        emotion_profile=data.get("emotion_profile"),
        dominant_emotion=data.get("dominant_emotion"),
        empathy_score=data.get("empathy_score"),
        politeness_level=data.get("politeness_level"),
        formality_level=data.get("formality_level"),
        next_actions=data.get("next_actions"),
        followup_priority=data.get("followup_priority"),
        conversation_phases=data.get("conversation_phases"),
        cooperation_index=data.get("cooperation_index"),
        dominance_score=data.get("dominance_score"),
        talk_ratio=data.get("talk_ratio"),
        interruptions=data.get("interruptions"),
        response_latency=data.get("response_latency"),
        summary_ai=data.get("summary_ai"),
        outcome_classification=data.get("outcome_classification"),
        highlights=data.get("highlights"),
        themes=data.get("themes"),
        confidence=data.get("confidence"),
    )

    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    logger.info(f"✅ Saved unstructured analysis for call_id={call_id}")
    return analysis
