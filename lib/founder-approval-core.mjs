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
    // The recovered repository can belong to a different account. Retain the
    // exact founder identity while allowing their accepted collaborator role.
    const trustedAssociation =
      comment?.author_association === "OWNER" ||
      comment?.author_association === "COLLABORATOR";

    return (
      comment?.user?.login === founderLogin &&
      trustedAssociation &&
      body === expected
    );
  });
}
