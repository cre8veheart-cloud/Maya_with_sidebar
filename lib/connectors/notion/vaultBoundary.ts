export type NotionVaultConnectionStatus =
  | "pending-auth"
  | "connected"
  | "revoked";

export interface NotionVaultBinding {
  id: string;
  workspaceId: string;
  clientId: string;
  notionWorkspaceId: string;
  notionWorkspaceName?: string;
  rootPageId?: string;
  dataSourceIds: string[];
  credentialRef: string;
  status: NotionVaultConnectionStatus;
  connectedAt: string;
  connectedBy: string;
}

export interface NotionVaultOperation {
  workspaceId: string;
  clientId: string;
  bindingId: string;
  action: "list" | "import" | "export" | "sync";
  resourceId?: string;
  approvedByUser: boolean;
}

export function authorizeNotionVaultOperation(input: {
  authenticatedWorkspaceId: string;
  authenticatedClientId: string | null;
  binding: NotionVaultBinding | null;
  operation: NotionVaultOperation;
}): { allowed: boolean; reason?: string } {
  if (!input.authenticatedClientId) {
    return { allowed: false, reason: "Select an authenticated Client Vault first." };
  }

  if (!input.binding || input.binding.status !== "connected") {
    return { allowed: false, reason: "This Client Vault has no active Notion connection." };
  }

  if (
    input.operation.workspaceId !== input.authenticatedWorkspaceId ||
    input.binding.workspaceId !== input.authenticatedWorkspaceId
  ) {
    return { allowed: false, reason: "Notion connection does not belong to this MAYA workspace." };
  }

  if (
    input.operation.clientId !== input.authenticatedClientId ||
    input.binding.clientId !== input.authenticatedClientId
  ) {
    return { allowed: false, reason: "Notion connection does not belong to the selected Client Vault." };
  }

  if (input.operation.bindingId !== input.binding.id) {
    return { allowed: false, reason: "Notion binding mismatch." };
  }

  if (
    ["import", "export", "sync"].includes(input.operation.action) &&
    !input.operation.approvedByUser
  ) {
    return { allowed: false, reason: "Human approval is required before Notion data moves." };
  }

  return { allowed: true };
}

export const NOTION_VAULT_RULES = {
  credentialStorage: "encrypted-server-reference-only",
  browserTokensAllowed: false,
  globalWorkspaceTokenAllowed: false,
  crossClientSearchAllowed: false,
  humanApprovalRequiredForWrites: true,
} as const;
