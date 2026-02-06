---
description: Creating a step-by-step implementation plan for a milestone or complex task
---

# /Plan Workflow

This workflow is used to break down a specified feature or a broad roadmap milestone into a sequence of actionable development steps.

## Steps

1. **Review Specification**
   - Ensure a corresponding feature spec exists in `.agent/spec/features/`.
   - Verify that all technical decisions from `/Clarify` are incorporated.

2. **Task Categorization**
   - Break the implementation into logical layers:
     - **Database**: Schema migrations or new collections.
     - **Backend**: API endpoints, logic, and validations.
     - **Frontend**: Component creation, state management, and UI.
     - **Integration**: Connecting the layers.

3. **Dependency Mapping**
   - Identify the "Critical Path" (which tasks must be done first).
   - Group tasks into "Phases" (e.g., Phase 1: Models, Phase 2: Logic).

4. **Detailed Action Plan**
   - Create a `Plan.md` or update the [Roadmap.md](../spec/Roadmap.md).
   - For each step, define:
     - **Task**: Clear description.
     - **Files**: Specific files to be created or modified.
     - **Verification**: How to confirm this step is done.

5. **Approval**
   - Present the plan to the user.
   - Once approved, proceed to implementation.
