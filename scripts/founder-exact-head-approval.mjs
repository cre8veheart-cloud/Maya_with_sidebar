import { readFile } from "node:fs/promises";

import {
  hasExactFounderApproval,
  isApprovalWorkflowRelevantEvent,
} from "../lib/founder-approval-core.mjs";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

async function githubRequest(url, token, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: ["Bearer", token].join(" "),
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed (${response.status} ${response.statusText}) for ${url}: ${await response.text()}`,
    );
  }

  return response;
}

function getPullRequestNumber(eventName, eventPayload) {
  if (eventName === "pull_request") return eventPayload?.pull_request?.number;
  return eventPayload?.issue?.number;
}

async function main() {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) throw new Error("Missing GH_TOKEN or GITHUB_TOKEN");

  const repository = getRequiredEnv("REPOSITORY");
  const eventName = getRequiredEnv("EVENT_NAME");
  const founderLogin = getRequiredEnv("FOUNDER_LOGIN");
  const eventPath = getRequiredEnv("GITHUB_EVENT_PATH");
  const eventPayload = JSON.parse(await readFile(eventPath, "utf8"));

  if (
    !isApprovalWorkflowRelevantEvent(eventName, eventPayload, founderLogin)
  ) {
    console.log("Skipping founder exact-head approval for unrelated comment.");
    return;
  }

  const pullRequestNumber = getPullRequestNumber(eventName, eventPayload);
  if (!pullRequestNumber) {
    throw new Error("Unable to determine pull request number from event payload");
  }

  const baseUrl = `https://api.github.com/repos/${repository}`;
  const pullRequest = await githubRequest(
    `${baseUrl}/pulls/${pullRequestNumber}`,
    token,
  ).then((response) => response.json());
  const headSha = pullRequest?.head?.sha;

  if (!headSha) {
    throw new Error(`Unable to determine head SHA for PR #${pullRequestNumber}`);
  }

  const comments = await githubRequest(
    `${baseUrl}/issues/${pullRequestNumber}/comments?per_page=100`,
    token,
  ).then((response) => response.json());

  const approved = hasExactFounderApproval(comments, founderLogin, headSha);
  const description = approved
    ? `Founder approved exact head ${headSha}`
    : `Awaiting founder approval for exact head ${headSha}`;

  await githubRequest(`${baseUrl}/statuses/${headSha}`, token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state: approved ? "success" : "pending",
      context: "Founder exact-head approval",
      description,
      target_url: `https://github.com/${repository}/pull/${pullRequestNumber}`,
    }),
  });

  if (!approved) {
    console.log(
      `Awaiting founder approval comment exactly 'APPROVE ${headSha}' as @${founderLogin}.`,
    );
    return;
  }

  console.log(`Founder approval verified for exact head ${headSha}.`);
}

await main();
