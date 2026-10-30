import { NextRequest, NextResponse } from "next/server";
import {
  getRepoContents,
  getRepoSummary,
  listBranches,
  listIssues,
  listPullRequests,
  listWorkflows,
  listWorkflowRuns,
  resolveRepoConfig,
} from "@/lib/github/api";
import { getCurrentGitHubSession } from "@/lib/github/session";
import { logGitHubAudit } from "@/lib/github/store";

export async function POST(req: NextRequest) {
  const session = await getCurrentGitHubSession();
  if (!session) {
    return NextResponse.json({ error: "GitHub is not connected" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    const repoConfig = resolveRepoConfig(session, {
      owner: typeof body.owner === "string" ? body.owner : undefined,
      repo: typeof body.repo === "string" ? body.repo : undefined,
      branch: typeof body.branch === "string" ? body.branch : undefined,
    });

    let result: unknown;
    if (action === "repo") {
      result = await getRepoSummary(session, repoConfig);
    } else if (action === "contents") {
      result = await getRepoContents(session, repoConfig, body.path as string);
    } else if (action === "pulls") {
      result = await listPullRequests(
        session,
        repoConfig,
        typeof body.state === "string" ? body.state : "open"
      );
    } else if (action === "issues") {
      result = await listIssues(
        session,
        repoConfig,
        typeof body.state === "string" ? body.state : "open"
      );
    } else if (action === "workflows") {
      result = await listWorkflows(session, repoConfig);
    } else if (action === "workflowRuns") {
      result = await listWorkflowRuns(
        session,
        repoConfig,
        typeof body.workflowId === "string" ? body.workflowId : undefined
      );
    } else if (action === "branches") {
      result = await listBranches(session, repoConfig);
    } else {
      throw new Error("Unsupported read action");
    }

    await logGitHubAudit(session.id, {
      kind: action === "workflows" || action === "workflowRuns" ? "workflow" : "read",
      action,
      target: `${repoConfig.owner}/${repoConfig.repo}`,
      status: "success",
      detail: "Read action completed",
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    await logGitHubAudit(session.id, {
      kind: "read",
      action: "read.failed",
      target: session.repoConfig ? `${session.repoConfig.owner}/${session.repoConfig.repo}` : "unconfigured",
      status: "error",
      detail: error instanceof Error ? error.message : "Read action failed",
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Read action failed" },
      { status: 400 }
    );
  }
}
