import type { SkillInfo } from "~/types";

const STORAGE_KEY = "debug:skill_names";

export function useSkillsPicker() {
  const config = useRuntimeConfig();
  const skills = ref<SkillInfo[]>([]);
  const selectedNames = ref<string[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  function loadStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      selectedNames.value = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      selectedNames.value = [];
    }
  }

  function saveSelected(names: string[]) {
    selectedNames.value = names;
    if (names.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function toggle(name: string) {
    if (selectedNames.value.includes(name)) {
      saveSelected(selectedNames.value.filter((n) => n !== name));
    } else {
      saveSelected([...selectedNames.value, name]);
    }
  }

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${config.public.apiBase}/v1/skills`);
      if (!res.ok) throw new Error(`List skills failed: ${res.status}`);
      const data = (await res.json()) as { skills: SkillInfo[] };
      skills.value = data.skills;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadStored();
  });

  return {
    skills,
    selectedNames,
    loading,
    error,
    refresh,
    toggle,
    saveSelected,
    loadStored,
  };
}
