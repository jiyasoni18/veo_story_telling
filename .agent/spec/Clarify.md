# Clarification Process (Clarify)

The "Clarify" process is designed to prevent "logic drift" and ensure that the implementation never proceeds on assumptions.

## 🧐 When to Clarify
- **Contradictions**: When a new request conflicts with the [Project Constitution](./Constitution.md).
- **Vague Requirements**: When "make it look good" needs technical definition (e.g., color palettes, specific fonts).
- **Technical Trade-offs**: When choosing between two libraries or architectural patterns.
- **Edge Cases**: When a user flow has an undefined "failure state."

## 📋 Clarification Standard
All clarifications must follow the **"Problems & Paths"** format:
1.  **The Roadblock**: A concise description of the uncertainty.
2.  **Path A**: Description, pros, cons, and implementation effort.
3.  **Path B**: Description, pros, cons, and implementation effort.
4.  **Recommendation**: Which path aligns best with the existing specification.

## 🔄 Closing the Loop
A clarification is only complete when:
- The user has chosen a path.
- The [Project_Spec.md](./Project_Spec.md) or a feature spec has been updated to reflect the choice.
