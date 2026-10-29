import type { MayaProvider, ProviderSettings } from "./types";

const STORAGE_KEY = "maya_provider_settings";

const DEFAULT_SETTINGS: ProviderSettings = {
  provider: "anthropic",
  anthropicModel: "",
  openClawModel: "",
  openAiModel: "",
  ludicrousMode: false,
};

function isProvider(value: unknown): value is MayaProvider {
  return value === "anthropic" || value === "openclaw" || value === "openai";
}

export function loadProviderSettings(): ProviderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<ProviderSettings>;
    return {
      provider: isProvider(parsed.provider)
        ? parsed.provider
        : DEFAULT_SETTINGS.provider,
      anthropicModel:
        typeof parsed.anthropicModel === "string" ? parsed.anthropicModel : "",
      openClawModel:
        typeof parsed.openClawModel === "string" ? parsed.openClawModel : "",
      openAiModel:
        typeof parsed.openAiModel === "string" ? parsed.openAiModel : "",
      ludicrousMode: parsed.ludicrousMode === true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveProviderSettings(settings: ProviderSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function updateProvider(
  provider: MayaProvider
): ProviderSettings {
  const next = { ...loadProviderSettings(), provider };
  saveProviderSettings(next);
  return next;
}

export function getProviderModel(settings: ProviderSettings): string {
  if (settings.provider === "anthropic") return settings.anthropicModel.trim();
  if (settings.provider === "openai") return settings.openAiModel.trim();
  return settings.openClawModel.trim();
}
