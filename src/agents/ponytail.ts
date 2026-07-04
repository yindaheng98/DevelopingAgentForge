const PONYTAIL_SKILL_URL =
  "https://raw.githubusercontent.com/DietrichGebert/ponytail/HEAD/skills/ponytail/SKILL.md";
const PONYTAIL_REVIEW_SKILL_URL =
  "https://raw.githubusercontent.com/DietrichGebert/ponytail/HEAD/skills/ponytail-review/SKILL.md";

async function downloadPrompt(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${String(response.status)} ${response.statusText}`);
  }
  return response.text();
}

export const [ponytailSkillPrompt, ponytailReviewSkillPrompt] = await Promise.all([
  downloadPrompt(PONYTAIL_SKILL_URL),
  downloadPrompt(PONYTAIL_REVIEW_SKILL_URL),
]);
