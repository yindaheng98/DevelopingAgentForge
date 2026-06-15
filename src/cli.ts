#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { runPipelinesCli } from "coding-agent-forge";
import { developingPipeline } from "./pipeline.js";
import { developingSkillPipeline } from "./pipelineskill.js";

function isDirectCli(): boolean {
  const entry = process.argv[1];
  return entry !== undefined && import.meta.url === pathToFileURL(entry).href;
}

if (isDirectCli()) {
  await runPipelinesCli([developingPipeline, developingSkillPipeline], process.argv.slice(2));
}
