import type { ExecRole } from "./types";

export type RoutedRole = ExecRole | "strategy-room";

export const EXEC_ROLE_META: Record<RoutedRole, { label: string; href: string }> = {
  ceo: { label: "CEO", href: "/ceo" },
  coo: { label: "COO", href: "/coo" },
  cmo: { label: "Erica · CMO", href: "/cmo" },
  cfo: { label: "CFO", href: "/cfo" },
  cto: { label: "CTO", href: "/cto" },
  cio: { label: "CIO", href: "/cio" },
  cro: { label: "CRO", href: "/cro" },
  cd: { label: "CD", href: "/cd" },
  admin: { label: "Office Admin", href: "/office-admin" },
  hr: { label: "HR", href: "/hr" },
  legal: { label: "Legal", href: "/legal" },
  "strategy-room": { label: "Strategy Room", href: "/strategy-room" },
};

export const EXEC_ROLE_OPTIONS = Object.keys(EXEC_ROLE_META).filter(
  (role) => role !== "strategy-room"
) as ExecRole[];

const ROUTED_ROLE_SET = new Set<RoutedRole>(
  Object.keys(EXEC_ROLE_META) as RoutedRole[]
);
const EXEC_ROLE_SET = new Set<ExecRole>(EXEC_ROLE_OPTIONS);

export function isRoutedRole(value: unknown): value is RoutedRole {
  return typeof value === "string" && ROUTED_ROLE_SET.has(value as RoutedRole);
}

export function isExecRole(value: unknown): value is ExecRole {
  return typeof value === "string" && EXEC_ROLE_SET.has(value as ExecRole);
}

export function getRoleLabel(role: RoutedRole): string {
  return EXEC_ROLE_META[role].label;
}

export function getRoleHref(role: RoutedRole): string {
  return getSafeRoleHref(role) || "/";
}

export function getSafeRoleHref(role: unknown): string | null {
  switch (role) {
    case "ceo":
      return "/ceo";
    case "coo":
      return "/coo";
    case "cmo":
      return "/cmo";
    case "cfo":
      return "/cfo";
    case "cto":
      return "/cto";
    case "cio":
      return "/cio";
    case "cro":
      return "/cro";
    case "cd":
      return "/cd";
    case "admin":
      return "/office-admin";
    case "hr":
      return "/hr";
    case "legal":
      return "/legal";
    case "strategy-room":
      return "/strategy-room";
    default:
      return null;
  }
}
