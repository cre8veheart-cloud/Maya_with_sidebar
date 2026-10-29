"use client";

import type { ProviderSettings } from "@/lib/maya/types";

interface ProviderControlsProps {
  settings: ProviderSettings;
  onChange: (settings: ProviderSettings) => void;
  compact?: boolean;
}

export default function ProviderControls({
  settings,
  onChange,
  compact = false,
}: ProviderControlsProps) {
  const activeModel =
    settings.provider === "anthropic"
      ? settings.anthropicModel
      : settings.provider === "openai"
        ? settings.openAiModel
        : settings.openClawModel;

  function updateModel(value: string) {
    onChange(
      settings.provider === "anthropic"
        ? { ...settings, anthropicModel: value }
        : settings.provider === "openai"
          ? { ...settings, openAiModel: value }
          : { ...settings, openClawModel: value }
    );
  }

  return (
    <div
      className={`rounded-xl border border-[#313244] bg-[#1e1e2e] ${
        compact ? "px-3 py-2" : "p-4"
      }`}
    >
      <div
        className={`flex ${compact ? "items-center gap-3 flex-wrap" : "flex-col gap-3"}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
            Provider
          </span>
          {(["anthropic", "openai", "openclaw"] as const).map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => onChange({ ...settings, provider })}
              className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-colors ${
                settings.provider === provider
                  ? "bg-[#89b4fa] text-[#1e1e2e]"
                  : "bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]"
              }`}
            >
              {provider === "anthropic"
                ? "Claude"
                : provider === "openai"
                  ? "ChatGPT"
                  : "OpenClaw"}
            </button>
          ))}
        </div>

        <label className="flex-1 min-w-[220px]">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-1.5">
            Model / Route
          </span>
          <input
            value={activeModel}
            onChange={(e) => updateModel(e.target.value)}
            placeholder={
              settings.provider === "anthropic"
                ? "Optional Claude model override"
                : settings.provider === "openai"
                  ? "Optional ChatGPT model override"
                  : "Optional OpenClaw route or model"
            }
            className="w-full bg-[#313244] border border-[#45475a] rounded-lg px-3 py-2 text-[13px] text-[#cdd6f4] placeholder-[#585b70] focus:outline-none focus:border-[#89b4fa] transition-colors"
          />
        </label>

        <button
          type="button"
          onClick={() =>
            onChange({ ...settings, ludicrousMode: !settings.ludicrousMode })
          }
          className={`rounded-lg border px-3 py-2 text-left transition-colors min-w-[220px] ${
            settings.provider !== "openclaw"
              ? "border-[#313244] bg-[#181825] text-[#585b70]"
              : settings.ludicrousMode
                ? "border-[#f38ba8] bg-[#3b1f2b] text-[#f9e2af]"
                : "border-[#45475a] bg-[#313244] text-[#cdd6f4] hover:border-[#f38ba8]"
          }`}
        >
          <span className="block text-[11px] font-semibold uppercase tracking-[0.07em]">
            Oracle Mode
          </span>
          <span className="block mt-1 text-[12px] leading-relaxed">
            {settings.provider !== "openclaw"
              ? "Switch to OpenClaw to enable Maya’s deep mode."
              : settings.ludicrousMode
                ? "On — Maya runs in deep mode with a higher-output OpenClaw response profile."
                : "Off — keep OpenClaw in its standard executive mode."}
          </span>
        </button>
      </div>
    </div>
  );
}
