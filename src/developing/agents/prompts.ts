export const DEVELOPING_CONTRACT = `
The coding plan is the engineering contract.
Testing and harness are separate:
- Tests verify code behavior and interfaces.
- Harnesses execute paper experiments and produce parseable raw results.
Raw-first export is mandatory.
Do not change metric definitions, baseline fairness rules, or method freeze rules unless the current task explicitly requires it.
Every implementation decision must preserve claim linkage from paper blueprint / experiment plan / coding plan.
`;

export const REPORT_HEADER = `
Use this report shape:
STATUS: PASS | FAIL | BLOCKED | NEEDS_REPAIR | FINISHED_CANDIDATE
TASK_ID:
SUMMARY:
FILES_READ:
FILES_CHANGED:
COMMANDS_RUN:
EVIDENCE:
BLOCKERS:
NON_BLOCKING_ISSUES:
NEXT_TASK_PROPOSAL:
`;
