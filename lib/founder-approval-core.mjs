export function isApprovalWorkflowRelevantEvent(
  eventName,
  eventPayload,
  founderLogin,
) {
  if (eventName === "pull_request") return true;
  if (eventName !== "issue_comment" || !eventPayload?.issue?.pull_request) {
    return false;
  }

  const commentLogin = eventPayload?.comment?.user?.login;
  const commentBody = String(eventPayload?.comment?.body ?? "").trim();

  return commentLogin === founderLogin && commentBody.startsWith("APPROVE ");
}

export function hasExactFounderApproval(comments, founderLogin, headSha) {
  const expected = `APPROVE ${headSha}`;

  return comments.some((comment) => {
    const body = String(comment?.body ?? "").trim();

    return (
      comment?.user?.login === founderLogin &&
      comment?.author_association === "OWNER" &&
      body === expected
    );
  });
}
