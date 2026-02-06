---
description: Executing a single discrete task from an approved implementation plan
---

# /Task Workflow

This workflow is used to execute a single, well-defined task. This is the "Execution" phase where actual code changes are made.

## Steps

1. **Task Context**
   - Identify which task from the [Plan](../spec/Plan.md) is being executed.
   - Verify that the parent [Specification](../spec/Project_Spec.md) is current.

2. **Work Artifact Creation**
   - For complex tasks, create a temporary `current_task.md` in `.agent/tasks/` to track:
     - Current state.
     - Files modified.
     - Any minor technical notes or deviations.

3. **Implementation**
   - Write/Modify the code according to the task description.
   - Adhere strictly to the [Project Constitution](../spec/Constitution.md).
   - Use `write_to_file` or `replace_file_content` for changes.

4. **Self-Correction & Linting**
   - Review the changes for obvious errors.
   - Ensure imports are correct and types are handled.

5. **Local Verification**
   - Perform the "Verification Step" defined in the original plan.
   - Run tests or check UI output if possible.

6. **Completion**
   - Mark the task as "Complete" in the plan or roadmap.
   - Delete the temporary task artifact (if created).
