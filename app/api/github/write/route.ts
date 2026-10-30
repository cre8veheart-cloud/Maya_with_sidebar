import { NextRequest, NextResponse } from "next/server";
import {
  createBranch,
  createPullRequest,
  dispatchWorkflow,
  resolveRepoConfig,
  upsertFile,
} from "@/lib/github/api";
import { getGitHubPermissions } from "@/lib/github/config";
import { getCurrentGitHubSession } from "@/lib/github/session";
import { logGitHubAudit } from "@/lib/github/store";

export async function POST(req: NextRequest) {
  const session = await getCurrentGitHubSession();
  if (!session) {
    return NextResponse.json({ error: "GitHub is not connected" }, { status: 401 });
  }

  const permissions = getGitHubPermissions(session.scope);
  if (!permissions.write) {
    await logGitHubAudit(session.id, {
      kind: "write",
      action: "write.denied",
      target: session.repoConfig
        ? `${session.repoConfig.owner}/${session.repoConfig.repo}`
        : "unconfigured",
      status: "denied",
      detail: "Connected GitHub session does not include repository write scope",
    });
    return NextResponse.json(
      { error: "Reconnect GitHub and authorize repository write access" },
      { status: 403 },
    );
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
    if (action === "branch" || action === "createBranch") {
      result = await createBranch(
        session,
        repoConfig,
        typeof body.sourceBranch === "string" ? body.sourceBranch : repoConfig.branch,
        typeof body.newBranch === "string" ? body.newBranch : "",
      );
    } else if (action === "file" || action === "upsertFile") {
      result = await upsertFile(session, repoConfig, {
        branch: typeof body.branch === "string" ? body.branch : undefined,
        path: typeof body.path === "string" ? body.path : "",
        content: typeof body.content === "string" ? body.content : "",
        message: typeof body.message === "string" ? body.message : "",
        sha: typeof body.sha === "string" ? body.sha : undefined,
      });
    } else if (action === "pull" || action === "createPullRequest") {
      result = await createPullRequest(session, repoConfig, {
        title: typeof body.title === "string" ? body.title : "",
        body: typeof body.body === "string" ? body.body : "",
        head: typeof body.head === "string" ? body.head : "",
        base: typeof body.base === "string" ? body.base : undefined,
      });
    } else if (action === "workflow" || action === "dispatchWorkflow") {
      if (!permissions.workflow) {
        return NextResponse.json(
          { error: "Reconnect GitHub and authorize workflow access" },
          { status: 403 },
        );
      }
      const inputs =
        body.inputs && typeof body.inputs === "object" && !Array.isArray(body.inputs)
          ? Object.fromEntries(
              Object.entries(body.inputs as Record<string, unknown>).map(([key, value]) => [
                key,
                String(value),
              ]),
            )
          : undefined;
      result = await dispatchWorkflow(session, repoConfig, {
        workflowId: typeof body.workflowId === "string" ? body.workflowId : "",
        ref: typeof body.ref === "string" ? body.ref : undefined,
        inputs,
      });
    } else {
      throw new Error("Unsupported write action");
    }

    await logGitHubAudit(session.id, {
      kind: action === "workflow" || action === "dispatchWorkflow" ? "workflow" : "write",
      action,
      target: `${repoConfig.owner}/${repoConfig.repo}`,
      status: "success",
      detail: "GitHub action completed",
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    await logGitHubAudit(session.id, {
      kind: "write",
      action: "write.failed",
      target: session.repoConfig
        ? `${session.repoConfig.owner}/${session.repoConfig.repo}`
        : "unconfigured",
      status: "error",
      detail: error instanceof Error ? error.message : "GitHub action failed",
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GitHub action failed" },
      { status: 400 },
    );
  }
}
