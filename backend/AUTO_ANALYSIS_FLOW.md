# Auto-Analysis & Scoring Flow

## Overview
The system now automatically analyzes and scores leads when you view their details. No need for manual API calls!

## 🔄 Automatic Flow

### When User Clicks on a Lead

```
User clicks lead → GET /leads/{id}/details
                          ↓
            ┌─────────────┴──────────────┐
            │  Check Lead Status          │
            └─────────────┬──────────────┘
                          ↓
            ┌─────────────┴──────────────┐
            │  Has Calls?                 │
            └─────────────┬──────────────┘
                     Yes  │  No
            ┌─────────────┴──────────────┐
            │  Return lead (no analysis)  │ ← No calls yet
            └─────────────────────────────┘
                          │
                     Yes  ↓
            ┌─────────────┴──────────────┐
            │  Check Call Analysis        │
            └─────────────┬──────────────┘
                          ↓
            ┌─────────────┴──────────────┐
            │  Unanalyzed calls exist?    │
            └─────────────┬──────────────┘
                     Yes  │  No
            ┌─────────────┴──────────────┐
            │  Auto-Analyze All Calls     │ ← 🤖 Automatic
            │  (Gemini API calls)         │
            └─────────────┬──────────────┘
                          ↓
            ┌─────────────┴──────────────┐
            │  Check Lead Score           │
            └─────────────┬──────────────┘
                          ↓
            ┌─────────────┴──────────────┐
            │  Score exists?              │
            └─────────────┬──────────────┘
                     No   │  Yes
            ┌─────────────┴──────────────┐
            │  Auto-Calculate Score       │ ← 📈 Automatic
            └─────────────┬──────────────┘
                          ↓
            ┌─────────────┴──────────────┐
            │  Return Complete Details    │
            └─────────────────────────────┘
```

## API Endpoints

### 1. Standard Details Endpoint (Auto-Processing)
```
GET /leads/{lead_id}/details
```

**Behavior:**
- ✅ Automatically analyzes unanalyzed calls
- ✅ Automatically scores if not scored
- ✅ Returns complete lead details
- ⚡ Silent processing (no extra status info)

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "call_logs": [
    {
      "id": 1,
      "transcription": "...",
      "unstructured_analyses": [
        {
          "sentiment": "positive",
          "conversion_probability": 75,
          "trust_score": 8.5,
          // ... all 34 AI metrics
        }
      ]
    }
  ]
}
```

### 2. Details with Status Endpoint (Verbose)
```
GET /leads/{lead_id}/details-with-status
```

**Behavior:**
- ✅ Same auto-processing as above
- ✅ Returns detailed status of what was done
- ✅ Shows errors if any occurred
- 📊 Useful for debugging or showing progress

**Response:**
```json
{
  "lead": {
    // ... full lead details
  },
  "status": {
    "lead_id": 1,
    "has_calls": true,
    "total_calls": 3,
    "analyzed_calls": 3,
    "newly_analyzed": 2,
    "analysis_errors": [],
    "has_score": true,
    "score_value": 78.5,
    "newly_scored": true,
    "actions_taken": [
      "Started analyzing 2 calls",
      "Successfully analyzed 2 new calls",
      "Calculated new lead score: 78.5"
    ]
  }
}
```

## Processing Logic

### Call Analysis
1. **Check each call for transcription**
   - If no transcription → Skip
   - If has transcription → Check for analysis

2. **Check for existing analysis**
   - If `unstructured_analyses` exists → Skip (already analyzed)
   - If no analysis → Analyze now

3. **Analyze call**
   - Run hybrid Gemini analysis (4 parallel LLM calls + 9 local metrics)
   - Save 34 metrics to database
   - Continue to next call even if one fails

### Lead Scoring
1. **Check for existing score**
   - Query most recent `lead_score` entry
   - If exists → Skip scoring
   - If not exists → Calculate now

2. **Calculate score**
   - Combine structured data (credit_score, interest_level)
   - Aggregate AI analysis from all calls
   - Calculate weighted final score
   - Save to database

## Benefits

✅ **User Experience**
- No manual "Analyze" button needed
- Seamless data loading
- Always up-to-date information

✅ **Efficiency**
- Only analyzes what's missing
- Doesn't re-analyze existing data
- Parallel processing for speed

✅ **Reliability**
- Graceful error handling
- Continues even if some calls fail
- Logs all actions for debugging

✅ **Smart Caching**
- Once analyzed, never re-analyzed
- Once scored, uses existing score
- Reduces API costs

## Error Handling

### If Call Analysis Fails
```python
# System continues with other calls
# Logs error but doesn't fail entire request
# Returns partial results
```

### If Scoring Fails
```python
# System continues anyway
# Logs warning
# Returns lead details without score
```

### If No Calls Exist
```python
# Returns lead details immediately
# No processing attempted
# Status shows "No calls found"
```

## Performance

### First View (Unanalyzed Lead with 3 calls)
```
Request → Analyze 3 calls (parallel) → Score → Return
Time: ~15-20 seconds (depending on transcript length)
```

### Subsequent Views (Already Analyzed)
```
Request → Check (all analyzed) → Return
Time: <1 second (database query only)
```

### Large Lead (10+ calls)
```
Request → Analyze unanalyzed only → Score → Return
Time: Scales linearly with number of NEW calls only
```

## Usage in Frontend

### Current Implementation
```javascript
// Frontend already calls this endpoint
const data = await getLeadDetails(leadId);

// Data is automatically analyzed and scored!
// No extra API calls needed
```

### Enhanced Version (with status)
```javascript
// Use the status endpoint if you want to show progress
const response = await fetch(`/leads/${leadId}/details-with-status`);
const { lead, status } = await response.json();

// Show status to user
console.log(status.actions_taken);
// ["Started analyzing 2 calls", "Successfully analyzed 2 new calls", ...]
```

## Migration from Manual Flow

### Before (Manual)
```javascript
// User had to manually trigger analysis
await analyzeCall(callId1);
await analyzeCall(callId2);
await analyzeCall(callId3);
await scoreLeaD(leadId);
await getLeadDetails(leadId);
```

### Now (Automatic)
```javascript
// Just fetch details - everything happens automatically!
const leadDetails = await getLeadDetails(leadId);
```

## Monitoring

Check logs for processing status:
```bash
📊 Fetching details for lead_id=1
ℹ️ Lead 1 has no calls yet
# OR
🤖 Auto-analyzing 2 unanalyzed calls for lead 1
  → Analyzing call 5
  ✅ Call 5 analyzed successfully
  → Analyzing call 6
  ✅ Call 6 analyzed successfully
📈 Auto-scoring lead 1
✅ Lead 1 scored: 78.5
```

## Configuration

Currently automatic processing is **always on** for `/details` endpoints.

To disable auto-processing (if needed in future):
```python
# Add query parameter
@router.get("/{lead_id}/details")
async def get_lead_details(
    lead_id: int, 
    auto_analyze: bool = True,  # Add this
    db: AsyncSession = Depends(get_db)
):
    if not auto_analyze:
        # Skip auto-processing
        return lead
    # ... continue with auto-processing
```

## Summary

🎯 **Key Point:** You no longer need to manually call analysis endpoints. Just fetch lead details and everything happens automatically!

The system is smart enough to:
- ✅ Only analyze what needs analyzing
- ✅ Only score if not already scored
- ✅ Handle errors gracefully
- ✅ Return complete data in one call
