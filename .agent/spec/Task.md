# Task Execution Process (Task)

The "Task" phase is the engine room of the project. It is where specifications and plans are transformed into functional code.

## ⚙️ Execution Standards

Every task execution must follow these rules:

1.  **Atomic Changes**: Focus on a single logical change. If a task is too big, break it down further into sub-tasks.
2.  **No "Loose Ends"**: Do not leave `TODO` comments or half-finished logic. Every task should result in a feature that is at least partially functional or cleanly stubbed.
3.  **Style Compliance**: All code must match the aesthetics and technical constraints defined in the [Constitution](./Constitution.md).
4.  **Documentation Update**: If the code change introduces a new utility or API, update any relevant inline documentation or spec files.

## 📋 Task Tracking (Optional for complexity)

For tasks involving more than 5 files or complex logic, use the following tracking structure in a temporary file:

```markdown
# Current Task: [Task Name]

## 🛠️ Actions Taken
- [x] Initialized model X
- [ ] Refactored service Y

## 📂 Files Affected
- /backend/app/main.py
- /frontend/src/App.js

## ⚠️ Known Issues / Notes
- Waiting for Gemini API key to test edge case Z.
```

## 🔄 Lifecycle
Identification → Specification → Planning → **Task (Execution)** → Verification
