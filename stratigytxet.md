# STRATEGY TEXT (NOTEPAD) FEATURE

## Overview

Users can write, save, reload, and update free-text strategy notes per game session. This is a plain text notepad-style feature for players to plan their game strategy.

---

## Backend Implementation

### 1. Schema Update

**File:** `src/models/GameSession.js`

Added field (lines 179-182):

```js
strategyText: {
  type: String,
  default: "",
},
```

### 2. API Endpoint

**Route:** `PATCH /api/v1/game/strategy-text/:sessionId`

**File:** `src/routes/game.routes.js`

```js
router.patch("/strategy-text/:sessionId", authenticate, updateStrategyText);
```

### 3. Controller

**File:** `src/controllers/game.controller.js`

```js
const updateStrategyText = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const { strategyText } = req.body;

  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  if (typeof strategyText !== "string") {
    throw new AppError("strategyText must be a string", 400);
  }

  const session = await GameSession.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  session.strategyText = strategyText;
  await session.save();

  res.ok({ strategyText: session.strategyText }, "Strategy updated");
});
```

### 4. State API Update

**File:** `src/services/game.service.js`

Get game state now includes `strategyText`:

```js
async getGameState(sessionId) {
  const session = await this.getSession(sessionId);
  const initiatives = await initiativeRepository.findAll();
  return {
    sessionId: session._id,
    teamName: session.teamName,
    time: session.gameState.time,
    decisionNumber: session.gameState.decisionNumber,
    social: session.gameState.social,
    adoptedCount: getAdoptedCount(session.gameState.managers),
    score: calculateScore(session.gameState.managers),
    managers: session.gameState.managers,
    history: session.gameState.history,
    initiatives: initiatives,
    strategyText: session.strategyText || ""  // NEW FIELD
  };
}
```

---

## API Reference

### PATCH /api/v1/game/strategy-text/:sessionId

Update strategy text for a session.

#### Request

```json
{
  "strategyText": "My strategy is to focus on early adoption..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| strategyText | string | Yes | Plain text strategy |

#### Response (Success)

```json
{
  "success": true,
  "message": "Strategy updated",
  "data": {
    "strategyText": "My strategy is to focus on early adoption..."
  }
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "strategyText must be a string"
}
```

#### Response (Error - 404)

```json
{
  "success": false,
  "message": "Session not found"
}
```

---

### GET /api/v1/game/state/:sessionId

Get current game state (now includes strategyText).

#### Response

```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "teamName": "TEAM A",
    "time": 10,
    "decisionNumber": 2,
    "strategyText": "My strategy is to focus on early adoption...",
    ...
  }
}
```

---

## Frontend Integration

### 1. Textarea UI

```jsx
<textarea
  value={strategy}
  onChange={(e) => setStrategy(e.target.value)}
  placeholder="Write your strategy here..."
  className="w-full h-60 border p-4 rounded"
/>
```

### 2. Load Strategy on Mount

```jsx
useEffect(() => {
  async function load() {
    const res = await fetch(`/api/v1/game/state/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setStrategy(data.data.strategyText || "");
  }
  load();
}, [sessionId]);
```

### 3. Save with Button

```jsx
const saveStrategy = async () => {
  await fetch(`/api/v1/game/strategy-text/${sessionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ strategyText: strategy })
  });
};
```

### 4. Auto-save with Debounce (Recommended)

```jsx
useEffect(() => {
  const timeout = setTimeout(async () => {
    await fetch(`/api/v1/game/strategy-text/${sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ strategyText: strategy })
    });
  }, 1500); // 1.5 second delay

  return () => clearTimeout(timeout);
}, [strategy, sessionId]);
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     USER TYPES                          │
│                  "Focus on CEO first..."                │
└─────────────────────┬─────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                FRONTEND STATE                          │
│              setStrategy(text)                          │
└─────────────────────┬─────────────────────────────────┘
                      │
         ┌───────────┴───────────┐
         │                       │
    Button Click           Auto-save
         │              (debounce)
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│                   API CALL                           │
│ PATCH /api/v1/game/strategy-text/:sessionId          │
│ { strategyText: "..." }                             │
└─────────────────────┬─────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND                              │
│ Controller → Model → MongoDB                          │
└─────────────────────┬─────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   MongoDB                            │
│        GameSession.strategyText updated               │
└───���─��───────────────────────────────────────────────────┘
```

---

## Best Practices

1. **Use debounce for auto-save** - Avoid excessive API calls (1500ms recommended)
2. **Validate string input** - Backend validates `typeof strategyText === "string"`
3. **Handle errors** - Show user-friendly error messages
4. **Load on mount** - Fetch strategyText when session loads
5. **Provide feedback** - Show "Saving..." and "Saved" states

---

## Files Modified

| File | Changes |
|------|---------|
| `src/models/GameSession.js` | Added `strategyText` field |
| `src/controllers/game.controller.js` | Added `updateStrategyText` controller |
| `src/routes/game.routes.js` | Added PATCH route |
| `src/services/game.service.js` | Updated `getGameState` to include `strategyText` |

---

## Files Created

| File | Description |
|------|-------------|
| `docs/strategy-text-feature.md` | This documentation |