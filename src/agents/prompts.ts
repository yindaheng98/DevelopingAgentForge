export function codingStyleSkillInstruction(codingStyleSkillPath: string): string {
  return `Load and follow the skill at ${codingStyleSkillPath}. It describes how to keep repository code concise, readable, low-friction, and easy to modify.`;
}

export function goalInstruction(goal: string): string {
  return `
Current goal:
${goal}

Use this goal as the current high-level objective.
`;
}
