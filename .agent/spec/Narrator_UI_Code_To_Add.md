# Narrator Mode UI - Code to Add

## Location
Add this RIGHT AFTER the Background Visual Style card (before the closing `</section>` tag)

## Code to Insert

```jsx
<div className="setup-card glass">
    <div className="card-header">
        <UserCircle size={20} color="var(--primary)" />
        <h3>4. Narrator Mode</h3>
    </div>
    <div style={{ marginTop: '20px' }}>
        <label className="input-label">🎙️ Narrator Behavior</label>
        <select
            className="input-field"
            value={narratorMode}
            onChange={(e) => setNarratorMode(e.target.value)}
            style={{ cursor: 'pointer' }}
        >
            <option value="narrator_with_visuals">🎬 Narrator + Visual Scenes (Default)</option>
            <option value="narrator_only">🎙️ Narrator Only (Voiceover Driven)</option>
        </select>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            {narratorMode === 'narrator_with_visuals' 
                ? 'Narrator speaks as voiceover while characters perform actions and can also speak'
                : 'Only narrator speaks; characters shown visually but remain silent'}
        </p>
        <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: 'rgba(138, 43, 226, 0.1)', 
            border: '1px solid rgba(138, 43, 226, 0.3)', 
            borderRadius: '8px' 
        }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0 }}>
                💡 <strong>Tip:</strong> Mark a character as "Narrator" in Character Library to enable voiceover
            </p>
        </div>
    </div>
</div>
```

## Also Update

### Line 392 - Remove gridColumn
Change:
```jsx
<div className="setup-card glass" style={{ gridColumn: '1 / -1' }}>
```

To:
```jsx
<div className="setup-card glass">
```

This will make the Background card take up the left column, and the new Narrator card will take the right column.

## State Variable Already Added
✅ `const [narratorMode, setNarratorMode] = useState('narrator_with_visuals');`

## Result
```
┌─────────────────────────┬─────────────────────────┐
│ 3. Background Visual    │ 4. Narrator Mode        │
│    Style                │                         │
│                         │                         │
│ [Dropdown with 10       │ [Dropdown with 2        │
│  background styles]     │  narrator modes]        │
│                         │                         │
│ Applied to all          │ Narrator speaks as      │
│ environments...         │ voiceover...            │
│                         │                         │
│                         │ 💡 Tip: Mark character  │
│                         │    as "Narrator"...     │
└─────────────────────────┴─────────────────────────┘
```
