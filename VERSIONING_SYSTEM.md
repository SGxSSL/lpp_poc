# Lead Score Versioning System

## Overview
The Lead Prioritization Platform now includes a comprehensive versioning system for lead scores. This allows you to track how lead scores evolve as new calls are added and analyzed.

## Database Schema

### LeadScore Model (Updated)
```python
class LeadScore:
    id: int                          # Primary key
    lead_id: int                     # Foreign key to Lead
    officer_id: int                  # Foreign key to Officer
    score: float                     # The calculated score
    reason: str                      # Explanation of the score
    version: int                     # Version number (increments with each new score)
    total_calls_analyzed: int        # Number of calls used for this version
    call_ids_snapshot: List[int]     # JSON array of call IDs analyzed
    created_at: datetime             # When this version was created
    last_updated: datetime           # Last modification time
```

## How It Works

### 1. **Initial Analysis**
- When you first analyze a lead with 2 calls:
  - Version 1 is created
  - `total_calls_analyzed = 2`
  - `call_ids_snapshot = [1, 2]`
  - Score is calculated based on these 2 calls
  - Record is saved with `created_at` timestamp

### 2. **Subsequent Analysis**
- When a new call (call #3) is added and you re-analyze:
  - System checks for existing scores
  - Finds the latest version (v1)
  - Creates Version 2:
    - `version = 2`
    - `total_calls_analyzed = 3`
    - `call_ids_snapshot = [1, 2, 3]`
    - New score is calculated with all 3 calls
  - **Previous versions are retained** for history

### 3. **Version Tracking**
- Each re-analysis creates a new version
- Old versions remain in the database
- Allows you to:
  - Track score evolution over time
  - See which calls influenced each score
  - Compare scores across different time periods
  - Identify trends (improving vs. declining)

## API Endpoints

### POST `/leads/{lead_id}/analyze`
Analyzes all unanalyzed calls and creates a new score version.

**Response includes:**
```json
{
  "lead_id": 51,
  "success": true,
  "newly_analyzed": 1,
  "newly_scored": true,
  "score_value": 75.5,
  "score_version": 2,
  "actions_taken": [
    "Successfully analyzed 1 new calls",
    "Updated lead score from 72.3 (v1) to 75.5 (v2)"
  ]
}
```

### GET `/leads/{lead_id}/score-history`
Retrieves complete scoring history for a lead.

**Response:**
```json
{
  "lead_id": 51,
  "lead_name": "John Doe",
  "total_versions": 2,
  "current_score": {
    "id": 234,
    "version": 2,
    "score": 75.5,
    "reason": "Calculated from structured and unstructured data",
    "total_calls_analyzed": 3,
    "call_ids_snapshot": [101, 102, 103],
    "created_at": "2025-11-24T10:30:00",
    "last_updated": "2025-11-24T10:30:00"
  },
  "score_history": [
    {
      "id": 234,
      "version": 2,
      "score": 75.5,
      "total_calls_analyzed": 3,
      "call_ids_snapshot": [101, 102, 103],
      "created_at": "2025-11-24T10:30:00"
    },
    {
      "id": 233,
      "version": 1,
      "score": 72.3,
      "total_calls_analyzed": 2,
      "call_ids_snapshot": [101, 102],
      "created_at": "2025-11-23T14:15:00"
    }
  ]
}
```

## Frontend UI

### Score History Tab
A new "Score History" tab is available on the lead detail page that shows:

1. **Summary Card**
   - Total number of versions
   - Current score highlighted
   - Number of calls analyzed in latest version

2. **Version Timeline**
   - All score versions listed chronologically (newest first)
   - Each version shows:
     - Version number badge
     - Score value
     - Reason/explanation
     - Number of calls analyzed
     - Call IDs included
     - Creation timestamp
     - Score change indicator (↑/↓) compared to previous version

3. **Visual Indicators**
   - Current version highlighted in indigo
   - Green badge for "Current" version
   - Up/down arrows showing score trends
   - Color-coded changes (green=improvement, red=decline)

## Benefits

1. **Transparency**: See exactly which calls influenced each score
2. **Trend Analysis**: Track lead quality over time
3. **Audit Trail**: Complete history of all scoring decisions
4. **Reproducibility**: Know exactly what data was used for each score
5. **Comparison**: Compare current vs. previous scores to see improvement
6. **Debug Friendly**: If a score seems wrong, you can see the exact inputs used

## Example Workflow

```
Day 1: Lead created with 2 calls
→ Analyze → Version 1: Score = 65.0 (2 calls)

Day 3: New call added
→ Analyze → Version 2: Score = 72.5 (3 calls) [+7.5 improvement]

Day 7: Another call added
→ Analyze → Version 3: Score = 68.0 (4 calls) [-4.5 decline]

UI shows all 3 versions with trend indicators
```

## Migration

Run the migration to add versioning fields:
```bash
cd backend
alembic upgrade head
```

This adds:
- `version` column (default: 1)
- `total_calls_analyzed` column (default: 0)
- `call_ids_snapshot` JSON column
- `created_at` timestamp column

Existing scores are automatically assigned version 1.

## Future Enhancements

Potential additions to the versioning system:
- Chart showing score progression over time
- Comparison view between any two versions
- Export score history to CSV/PDF
- Alerts when score changes significantly
- ML model version tracking
- Confidence scores for each version
