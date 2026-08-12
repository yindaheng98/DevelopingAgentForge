import type { AgentConstants, RecordCallback, Thread } from "coding-agent-forge";
import { Agent } from "coding-agent-forge/agent";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

export type DevelopingConstantPrompt = { url: string } | { path: string } | { text: string };

export type DevelopingAgentVariables = {
  targetPath: string;
  goal: string;
};

export type DevelopingAgentConstants = AgentConstants & {
  workspacePath: string;
  prompts?: DevelopingConstantPrompt[];
};

export abstract class DevelopingAgent<
  Variables extends DevelopingAgentVariables = DevelopingAgentVariables,
  Constants extends DevelopingAgentConstants = DevelopingAgentConstants,
> extends Agent<Variables, Constants> {
  protected readonly workspacePath: string;
  protected constantsPromptText = "";
  private readonly constantsPromptTextPromise: Promise<void>;

  constructor(thread: Thread, constants: Readonly<Constants>) {
    if (!constants.workspacePath) {
      throw new Error("Developing agent constants.workspacePath must be configured.");
    }

    const workspacePath = path.resolve(constants.workspacePath);
    if (!statSync(workspacePath).isDirectory()) {
      throw new Error(`workspacePath must be a directory: ${workspacePath}`);
    }
    const { prompts, textPromise } = getPrompt(constants.prompts);
    super(thread, {
      ...constants,
      workspacePath,
      prompts,
    });
    this.workspacePath = workspacePath;
    this.constantsPromptTextPromise = textPromise.then((promptText) => {
      this.constantsPromptText = promptText;
    });
  }

  override async runStreamed(variables: Variables, onRecord?: RecordCallback): Promise<string> {
    await this.constantsPromptTextPromise;
    return super.runStreamed(variables, onRecord);
  }

  protected workspaceRelativePath(filePath: string): string {
    return `./${path.relative(this.workspacePath, path.resolve(filePath))}`;
  }
}

function getPrompt(prompts?: readonly DevelopingConstantPrompt[]): {
  prompts: DevelopingConstantPrompt[];
  textPromise: Promise<string>;
} {
  const promptTexts: Promise<string>[] = [];
  const resolvedPrompts = (prompts ?? []).map((prompt) => {
    if ("path" in prompt) {
      const promptPath = path.resolve(prompt.path);
      promptTexts.push(Promise.resolve(readFileSync(promptPath, "utf8")));
      return { path: promptPath };
    }
    if ("url" in prompt) {
      promptTexts.push(downloadPrompt(prompt.url));
      return { url: prompt.url };
    }
    promptTexts.push(Promise.resolve(prompt.text));
    return { text: prompt.text };
  });
  return {
    prompts: resolvedPrompts,
    textPromise: Promise.all(promptTexts).then((prompts) => {
      const promptText = prompts
        .map((prompt) => prompt.trim())
        .filter((prompt) => prompt !== "")
        .join("\n\n");
      return promptText === "" ? "" : `${promptText}\n`;
    }),
  };
}

async function downloadPrompt(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${String(response.status)} ${response.statusText}`);
  }
  return response.text();
}
