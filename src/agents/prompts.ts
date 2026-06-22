export function quoteBlock(content: string): string {
  return content
    .split(/\r?\n/)
    .map((line) => `> ${line}`)
    .join("\n");
}

export function goalInstruction(goal: string): string {
  return `
Goal:
${quoteBlock(goal)}
`;
}
