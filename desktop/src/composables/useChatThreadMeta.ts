export type ChatMode = "ask" | "plan" | "agent";

export interface ChatThreadMeta {
  mode: ChatMode;
  skills: string[];
}

const DEFAULT_META: ChatThreadMeta = { mode: "agent", skills: [] };

function storageKey(threadId: string): string {
  return `desktop:thread-meta:${threadId}`;
}

export function loadThreadMeta(threadId: string): ChatThreadMeta {
  try {
    const raw = localStorage.getItem(storageKey(threadId));
    if (!raw) return { ...DEFAULT_META };
    const parsed = JSON.parse(raw) as Partial<ChatThreadMeta>;
    const mode =
      parsed.mode === "ask" || parsed.mode === "plan" || parsed.mode === "agent"
        ? parsed.mode
        : DEFAULT_META.mode;
    const skills = Array.isArray(parsed.skills)
      ? parsed.skills.filter((s): s is string => typeof s === "string")
      : [];
    return { mode, skills };
  } catch {
    return { ...DEFAULT_META };
  }
}

export function saveThreadMeta(threadId: string, meta: ChatThreadMeta): void {
  localStorage.setItem(storageKey(threadId), JSON.stringify(meta));
}

export function toggleThreadSkill(meta: ChatThreadMeta, skillName: string): ChatThreadMeta {
  const skills = meta.skills.includes(skillName)
    ? meta.skills.filter((s) => s !== skillName)
    : [...meta.skills, skillName];
  return { ...meta, skills };
}

export function removeThreadSkill(meta: ChatThreadMeta, skillName: string): ChatThreadMeta {
  return { ...meta, skills: meta.skills.filter((s) => s !== skillName) };
}
