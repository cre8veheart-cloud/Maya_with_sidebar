import type { ExecRole } from "../types";

export interface ExecutiveChassis {
  role: ExecRole;
  version: string;
  hardGoal: string;
  systemContract: string;
  responseContract: string;
  capabilities: readonly string[];
  approvalBoundaries: readonly string[];
}
