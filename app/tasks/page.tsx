"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { getRoleLabel, isExecRole } from "@/lib/maya/execRouting";
import { loadWorkItems, type MayaWorkItem } from "@/lib/maya/libraryData";

const STATUS_FILTERS = ["All", "Approved", "Pending", "Dismissed"] as const;

export default function TasksPage() {
  const [items, setItems] = useState<MayaWorkItem[]>(loadWorkItems());
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All");

  useEffect(() => {
    setItems(loadWorkItems());
  }, []);

  const filteredItems = useMemo(() => {
    if (statusFilter === "All") return items;
    return items.filter(
      (item) => item.status === statusFilter.toLowerCase()
    );
  }, [items, statusFilter]);

  return (
    <PageShell
      title="Working Items"
      subtitle="All approved routed work in one place — clips, tasks, decisions, meetings, and follow-ups"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                statusFilter === filter
                  ? "bg-[#89b4fa]/20 text-[#89b4fa] border border-[#89b4fa]/40"
                  : "bg-[#1e1e2e] border border-[#313244] text-[#585b70] hover:text-[#cdd6f4]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_320px] gap-5">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
              Routed Work Queue
            </h2>
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <p className="text-[13px] text-[#585b70]">
                  No saved work items yet.
                </p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-[#313244] bg-[#181825] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] text-[#cdd6f4] font-medium">
                          {item.title}
                        </p>
                        <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap">
                          {item.summary}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase text-[#89b4fa]">
                          {item.type}
                        </p>
                        <p className="text-[10px] text-[#585b70] mt-1">
                          {item.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] text-[#585b70] uppercase">
                          Clipped by
                        </p>
                        <p className="text-[12px] text-[#cdd6f4] mt-1">
                          {item.clippedBy ? getRoleLabel(item.clippedBy) : getRoleLabel(item.sourceRole)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#585b70] uppercase">
                          Routed to
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.targetRoles.filter(isExecRole).map((role) => {
                            return (
                              <span
                                key={`${item.id}-${role}`}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-[#313244] text-[#89b4fa] hover:text-[#b4d0fb]"
                              >
                                {getRoleLabel(role)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {item.clipComment && (
                      <div className="mt-3">
                        <p className="text-[10px] text-[#585b70] uppercase">
                          Clipper comment
                        </p>
                        <p className="text-[12px] text-[#a6adc8] mt-1 whitespace-pre-wrap">
                          {item.clipComment}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {item.sessionId && (
                        <Link
                          href={`/library/sessions?session=${encodeURIComponent(item.sessionId)}`}
                          className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                        >
                          Open full session
                        </Link>
                      )}
                      {item.vendorUrl && (
                        <a
                          href={item.vendorUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#89b4fa] hover:text-[#b4d0fb]"
                        >
                          {item.vendorName ? `Vendor · ${item.vendorName}` : "Open vendor link"}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-4">
                Queue Summary
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Total items", value: `${items.length}` },
                  {
                    label: "Approved items",
                    value: `${items.filter((item) => item.status === "approved").length}`,
                  },
                  {
                    label: "Clip routes",
                    value: `${items.filter((item) => item.type === "clip").length}`,
                  },
                  {
                    label: "Execs targeted",
                    value: `${new Set(items.flatMap((item) => item.targetRoles)).size}`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-[#313244] pb-2 last:border-0"
                  >
                    <span className="text-[13px] text-[#cdd6f4]">{label}</span>
                    <span className="text-[13px] text-[#585b70]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
