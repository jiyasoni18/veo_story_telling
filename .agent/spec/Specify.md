# Specification Process (Specify)

The "Specify" phase is the critical bridge between requirements and implementation. It ensures that every change is well-thought-out and adheres to the [Project Constitution](./Constitution.md).

## 📋 Specifiction Requirements

Every feature specification must address:

1.  **Scope**: Define exactly what is being built and, importantly, what is *not* being built.
2.  **Architecture Alignment**: Explain how this feature fits into the existing [Project Spec](./Project_Spec.md).
3.  **Interface Design**: Define UI components, props, and backend API contracts.
4.  **State Management**: Detail how data flows through the feature.
5.  **Edge Cases**: Identify potential failures and how to handle them.

## 🛠️ Feature Spec Template

New feature specs should be created in `.agent/spec/features/FEATURE_NAME.md` using the following structure:

```markdown
# Feature: [Name]

## 1. Objective
[Short description of the goal]

## 2. Technical Strategy
[Detailed plan for implementation]

## 3. Impact Assessment
- **Files Modified**: ...
- **New Files**: ...
- **Database Migrations**: ...

## 4. UI/UX Plan
[Description of components and layout]

## 5. API Endpoints
[Definition of new/modified routes]

## 6. Success Criteria
[How to verify the implementation]
```

## 🔄 Lifecycle
Identification → **Specification** → Implementation → Verification
