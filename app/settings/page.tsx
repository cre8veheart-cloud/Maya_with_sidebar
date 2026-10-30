"use client";

import { useEffect, useState } from "react";
import ProviderControls from "@/components/ProviderControls";
import { loadProviderSettings, saveProviderSettings } from "@/lib/maya/providerStorage";
import type { ProviderSettings } from "@/lib/maya/types";

export default function SettingsPage() {
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>({
    provider: "anthropic",
    anthropicModel: "",
    openClawModel: "",
    openAiModel: "",
    ludicrousMode: false,
  });

  useEffect(() => {
    setProviderSettings(loadProviderSettings());
  }, []);

  function updateProviderSettings(next: ProviderSettings) {
    setProviderSettings(next);
    saveProviderSettings(next);
  }

  return (
    <div className="max-w-6xl p-8">
      <h1 className="text-2xl font-bold text-[#89b4fa]">Settings</h1>
      <p className="mt-2 text-[#cdd6f4]">Choose Maya&apos;s model provider and intelligence settings.</p>

      <div className="mt-6">
        <ProviderControls settings={providerSettings} onChange={updateProviderSettings} />
      </div>

      <div className="mt-4 rounded-xl border border-[#313244] bg-[#1e1e2e] p-4 text-[13px] text-[#a6adc8] leading-relaxed">
        <p>
          Repository administration is intentionally kept outside the MAYA product runtime.
          Product sessions do not receive GitHub read, write, workflow, or OAuth authority.
        </p>
      </div>
    </div>
  );
}
