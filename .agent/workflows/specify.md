---
description: Specifying a feature or change before implementation
---

# /Specify Workflow

This workflow is used to create a detailed technical specification for a specific feature or change request. No code changes should be made until this specification is reviewed or finalized.

## Steps

1. **Information Gathering**
   - Use `grep_search` and `find_by_name` to identify all relevant files.
   - Read the codebase to understand the current implementation.
   - Reference the [Project_Spec.md](../spec/Project_Spec.md) and [Constitution.md](../spec/Constitution.md).

2. **Drafting the Specification**
   - Create or update a feature-specific specification file in `.agent/spec/features/`.
   - The specification must include:
     - **Objective**: What is the goal of this change?
     - **Technical Approach**: How will it be implemented?
     - **Affected Components**: List of files to be modified.
     - **Data Model Changes**: Detailed schema updates if applicable.
     - **API Changes**: New or modified endpoints.
     - **Verification Plan**: How will we test this?

3. **User Review**
   - Present the specification to the user.
   - Wait for feedback or approval.

4. **Approval**
   - Once approved, move to the `/Implement` workflow.
