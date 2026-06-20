import { d as defineComponent, o as openBlock, b as createElementBlock, e as createBaseVNode, F as Fragment, f as renderList, n as normalizeClass, t as toDisplayString, i as computed, s as createTextVNode, u as unref, r as ref, a as onMounted, w as watch, g as createCommentVNode, c as createBlock, k as normalizeStyle } from "./index-CRlMfF3U.js";
const colors = {
  slate: {
    "50": "#f8fafc",
    "100": "#f1f5f9",
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a",
    "950": "#020617"
  },
  gray: {
    "50": "#f9fafb",
    "100": "#f3f4f6",
    "200": "#e5e7eb",
    "300": "#d1d5db",
    "400": "#9ca3af",
    "500": "#6b7280",
    "600": "#4b5563",
    "700": "#374151",
    "800": "#1f2937",
    "900": "#111827",
    "950": "#030712"
  },
  zinc: {
    "50": "#fafafa",
    "100": "#f4f4f5",
    "200": "#e4e4e7",
    "300": "#d4d4d8",
    "400": "#a1a1aa",
    "500": "#71717a",
    "600": "#52525b",
    "700": "#3f3f46",
    "800": "#27272a",
    "900": "#18181b",
    "950": "#09090b"
  },
  neutral: {
    "50": "#fafafa",
    "100": "#f5f5f5",
    "200": "#e5e5e5",
    "300": "#d4d4d4",
    "400": "#a3a3a3",
    "500": "#737373",
    "600": "#525252",
    "700": "#404040",
    "800": "#262626",
    "900": "#171717",
    "950": "#0a0a0a"
  },
  stone: {
    "50": "#fafaf9",
    "100": "#f5f5f4",
    "200": "#e7e5e4",
    "300": "#d6d3d1",
    "400": "#a8a29e",
    "500": "#78716c",
    "600": "#57534e",
    "700": "#44403c",
    "800": "#292524",
    "900": "#1c1917",
    "950": "#0c0a09"
  },
  red: {
    "50": "#fef2f2",
    "100": "#fee2e2",
    "200": "#fecaca",
    "300": "#fca5a5",
    "400": "#f87171",
    "500": "#ef4444",
    "600": "#dc2626",
    "700": "#b91c1c",
    "800": "#991b1b",
    "900": "#7f1d1d",
    "950": "#450a0a"
  },
  orange: {
    "50": "#fff7ed",
    "100": "#ffedd5",
    "200": "#fed7aa",
    "300": "#fdba74",
    "400": "#fb923c",
    "500": "#f97316",
    "600": "#ea580c",
    "700": "#c2410c",
    "800": "#9a3412",
    "900": "#7c2d12",
    "950": "#431407"
  },
  amber: {
    "50": "#fffbeb",
    "100": "#fef3c7",
    "200": "#fde68a",
    "300": "#fcd34d",
    "400": "#fbbf24",
    "500": "#f59e0b",
    "600": "#d97706",
    "700": "#b45309",
    "800": "#92400e",
    "900": "#78350f",
    "950": "#451a03"
  },
  yellow: {
    "50": "#fefce8",
    "100": "#fef9c3",
    "200": "#fef08a",
    "300": "#fde047",
    "400": "#facc15",
    "500": "#eab308",
    "600": "#ca8a04",
    "700": "#a16207",
    "800": "#854d0e",
    "900": "#713f12",
    "950": "#422006"
  },
  lime: {
    "50": "#f7fee7",
    "100": "#ecfccb",
    "200": "#d9f99d",
    "300": "#bef264",
    "400": "#a3e635",
    "500": "#84cc16",
    "600": "#65a30d",
    "700": "#4d7c0f",
    "800": "#3f6212",
    "900": "#365314",
    "950": "#1a2e05"
  },
  green: {
    "50": "#f0fdf4",
    "100": "#dcfce7",
    "200": "#bbf7d0",
    "300": "#86efac",
    "400": "#4ade80",
    "500": "#22c55e",
    "600": "#16a34a",
    "700": "#15803d",
    "800": "#166534",
    "900": "#14532d",
    "950": "#052e16"
  },
  emerald: {
    "50": "#ecfdf5",
    "100": "#d1fae5",
    "200": "#a7f3d0",
    "300": "#6ee7b7",
    "400": "#34d399",
    "500": "#10b981",
    "600": "#059669",
    "700": "#047857",
    "800": "#065f46",
    "900": "#064e3b",
    "950": "#022c22"
  },
  teal: {
    "50": "#f0fdfa",
    "100": "#ccfbf1",
    "200": "#99f6e4",
    "300": "#5eead4",
    "400": "#2dd4bf",
    "500": "#14b8a6",
    "600": "#0d9488",
    "700": "#0f766e",
    "800": "#115e59",
    "900": "#134e4a",
    "950": "#042f2e"
  },
  cyan: {
    "50": "#ecfeff",
    "100": "#cffafe",
    "200": "#a5f3fc",
    "300": "#67e8f9",
    "400": "#22d3ee",
    "500": "#06b6d4",
    "600": "#0891b2",
    "700": "#0e7490",
    "800": "#155e75",
    "900": "#164e63",
    "950": "#083344"
  },
  sky: {
    "50": "#f0f9ff",
    "100": "#e0f2fe",
    "200": "#bae6fd",
    "300": "#7dd3fc",
    "400": "#38bdf8",
    "500": "#0ea5e9",
    "600": "#0284c7",
    "700": "#0369a1",
    "800": "#075985",
    "900": "#0c4a6e",
    "950": "#082f49"
  },
  blue: {
    "50": "#eff6ff",
    "100": "#dbeafe",
    "200": "#bfdbfe",
    "300": "#93c5fd",
    "400": "#60a5fa",
    "500": "#3b82f6",
    "600": "#2563eb",
    "700": "#1d4ed8",
    "800": "#1e40af",
    "900": "#1e3a8a",
    "950": "#172554"
  },
  indigo: {
    "50": "#eef2ff",
    "100": "#e0e7ff",
    "200": "#c7d2fe",
    "300": "#a5b4fc",
    "400": "#818cf8",
    "500": "#6366f1",
    "600": "#4f46e5",
    "700": "#4338ca",
    "800": "#3730a3",
    "900": "#312e81",
    "950": "#1e1b4b"
  },
  violet: {
    "50": "#f5f3ff",
    "100": "#ede9fe",
    "200": "#ddd6fe",
    "300": "#c4b5fd",
    "400": "#a78bfa",
    "500": "#8b5cf6",
    "600": "#7c3aed",
    "700": "#6d28d9",
    "800": "#5b21b6",
    "900": "#4c1d95",
    "950": "#2e1065"
  },
  purple: {
    "50": "#faf5ff",
    "100": "#f3e8ff",
    "200": "#e9d5ff",
    "300": "#d8b4fe",
    "400": "#c084fc",
    "500": "#a855f7",
    "600": "#9333ea",
    "700": "#7e22ce",
    "800": "#6b21a8",
    "900": "#581c87",
    "950": "#3b0764"
  },
  fuchsia: {
    "50": "#fdf4ff",
    "100": "#fae8ff",
    "200": "#f5d0fe",
    "300": "#f0abfc",
    "400": "#e879f9",
    "500": "#d946ef",
    "600": "#c026d3",
    "700": "#a21caf",
    "800": "#86198f",
    "900": "#701a75",
    "950": "#4a044e"
  },
  pink: {
    "50": "#fdf2f8",
    "100": "#fce7f3",
    "200": "#fbcfe8",
    "300": "#f9a8d4",
    "400": "#f472b6",
    "500": "#ec4899",
    "600": "#db2777",
    "700": "#be185d",
    "800": "#9d174d",
    "900": "#831843",
    "950": "#500724"
  },
  rose: {
    "50": "#fff1f2",
    "100": "#ffe4e6",
    "200": "#fecdd3",
    "300": "#fda4af",
    "400": "#fb7185",
    "500": "#f43f5e",
    "600": "#e11d48",
    "700": "#be123c",
    "800": "#9f1239",
    "900": "#881337",
    "950": "#4c0519"
  },
  brand: {
    primary: "#2563eb",
    "primary-foreground": "#ffffff",
    secondary: "#64748b",
    "secondary-foreground": "#ffffff",
    accent: "#7c3aed",
    "accent-foreground": "#ffffff",
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    "muted-foreground": "#64748b",
    border: "#e2e8f0",
    destructive: "#ef4444"
  }
};
const spacing = {
  "0": "0px",
  "1": "0.25rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "7": "1.75rem",
  "8": "2rem",
  "9": "2.25rem",
  "10": "2.5rem",
  "11": "2.75rem",
  "12": "3rem",
  "14": "3.5rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
  "28": "7rem",
  "32": "8rem",
  "36": "9rem",
  "40": "10rem",
  "44": "11rem",
  "48": "12rem",
  "52": "13rem",
  "56": "14rem",
  "60": "15rem",
  "64": "16rem",
  "72": "18rem",
  "80": "20rem",
  "96": "24rem",
  px: "1px",
  "0.5": "0.125rem",
  "1.5": "0.375rem",
  "2.5": "0.625rem",
  "3.5": "0.875rem"
};
const defaults = {
  colors,
  spacing
};
const DEFAULT_THEME = defaults;
const COLOR_SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950"
];
const SEMANTIC_PALETTE = "brand";
const SEMANTIC_TOKEN_DEFS = [
  { key: "primary", label: "主色" },
  { key: "primary-foreground", label: "主色前景" },
  { key: "secondary", label: "次要色" },
  { key: "secondary-foreground", label: "次要前景" },
  { key: "accent", label: "强调色" },
  { key: "accent-foreground", label: "强调前景" },
  { key: "background", label: "背景" },
  { key: "foreground", label: "前景文字" },
  { key: "muted", label: "弱化背景" },
  { key: "muted-foreground", label: "弱化文字" },
  { key: "border", label: "边框" },
  { key: "destructive", label: "危险" }
];
const LEGACY_KEYS = [
  "primary",
  "secondary",
  "accent",
  "spacingSm",
  "spacingMd",
  "spacingLg"
];
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isColorPalette(value) {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}
function mergeColorScale(base, overlay) {
  if (!overlay) {
    return { ...base };
  }
  const merged = { ...base };
  for (const [name, value] of Object.entries(overlay)) {
    if (typeof value === "string") {
      merged[name] = value;
      continue;
    }
    const existing = merged[name];
    if (typeof existing === "string" || existing === void 0) {
      merged[name] = { ...value };
      continue;
    }
    merged[name] = { ...existing, ...value };
  }
  return merged;
}
function mergeSpacingScale(base, overlay) {
  if (!overlay) {
    return { ...base };
  }
  return { ...base, ...overlay };
}
function deepMergeTheme(base, ...layers) {
  let colors2 = { ...base.colors };
  let spacing2 = { ...base.spacing };
  for (const layer of layers) {
    colors2 = mergeColorScale(colors2, layer.colors);
    spacing2 = mergeSpacingScale(spacing2, layer.spacing);
  }
  return { colors: colors2, spacing: spacing2 };
}
function diffColorScale(merged, defaultsScale) {
  const diff = {};
  for (const [name, mergedValue] of Object.entries(merged)) {
    const defaultValue = defaultsScale[name];
    if (typeof mergedValue === "string") {
      if (mergedValue !== defaultValue) {
        diff[name] = mergedValue;
      }
      continue;
    }
    if (typeof defaultValue === "string" || defaultValue === void 0) {
      diff[name] = { ...mergedValue };
      continue;
    }
    const paletteDiff = {};
    for (const [shade, hex] of Object.entries(mergedValue)) {
      if (defaultValue[shade] !== hex) {
        paletteDiff[shade] = hex;
      }
    }
    if (Object.keys(paletteDiff).length > 0) {
      diff[name] = paletteDiff;
    }
  }
  return Object.keys(diff).length > 0 ? diff : void 0;
}
function diffSpacingScale(merged, defaultsScale) {
  const diff = {};
  for (const [key, value] of Object.entries(merged)) {
    if (defaultsScale[key] !== value) {
      diff[key] = value;
    }
  }
  return Object.keys(diff).length > 0 ? diff : void 0;
}
function diffOverrides(merged, defaultTheme = DEFAULT_THEME) {
  const colors2 = diffColorScale(merged.colors, defaultTheme.colors);
  const spacing2 = diffSpacingScale(merged.spacing, defaultTheme.spacing);
  const overrides = { version: 1 };
  if (colors2) {
    overrides.colors = colors2;
  }
  if (spacing2) {
    overrides.spacing = spacing2;
  }
  return overrides;
}
function hasLegacyFlatKeys(raw) {
  return LEGACY_KEYS.some((key) => typeof raw[key] === "string");
}
function migrateLegacyTokens(raw) {
  if (!isRecord(raw)) {
    return { version: 1 };
  }
  if (raw.version === 1) {
    const overrides2 = { version: 1 };
    if (isRecord(raw.colors)) {
      overrides2.colors = raw.colors;
    }
    if (isRecord(raw.spacing)) {
      overrides2.spacing = raw.spacing;
    }
    return overrides2;
  }
  if (!hasLegacyFlatKeys(raw)) {
    return { version: 1 };
  }
  const legacy = raw;
  const overrides = { version: 1 };
  const brand = {};
  const spacing2 = {};
  if (legacy.primary) {
    brand.primary = legacy.primary;
  }
  if (legacy.secondary) {
    brand.secondary = legacy.secondary;
  }
  if (legacy.accent) {
    brand.accent = legacy.accent;
  }
  if (legacy.spacingSm) {
    spacing2["2"] = legacy.spacingSm;
  }
  if (legacy.spacingMd) {
    spacing2["4"] = legacy.spacingMd;
  }
  if (legacy.spacingLg) {
    spacing2["8"] = legacy.spacingLg;
  }
  if (Object.keys(brand).length > 0) {
    overrides.colors = { brand };
  }
  if (Object.keys(spacing2).length > 0) {
    overrides.spacing = spacing2;
  }
  return overrides;
}
function isHuePalette(palette) {
  return "50" in palette && "500" in palette;
}
function listColorPalettes(theme) {
  return Object.keys(theme.colors).filter((name) => {
    const value = theme.colors[name];
    return isColorPalette(value) && isHuePalette(value);
  });
}
function sortSpacingKeys(keys) {
  return [...keys].sort((a, b) => {
    if (a === "0") {
      return -1;
    }
    if (b === "0") {
      return 1;
    }
    if (a === "px") {
      return b === "0" ? 1 : -1;
    }
    if (b === "px") {
      return a === "0" ? -1 : 1;
    }
    return parseFloat(a) - parseFloat(b);
  });
}
function extractBalancedBlock(content, openBraceIndex) {
  if (content[openBraceIndex] !== "{") {
    return null;
  }
  let depth = 0;
  for (let i = openBraceIndex; i < content.length; i++) {
    const ch = content[i];
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return content.slice(openBraceIndex + 1, i);
      }
    }
  }
  return null;
}
function findSectionBlock(block, key) {
  const re = new RegExp(`\\b${key}:\\s*\\{`);
  const match = re.exec(block);
  if (!match) {
    return null;
  }
  const braceIndex = block.indexOf("{", match.index);
  return extractBalancedBlock(block, braceIndex);
}
function parseStringLiteral(source, start) {
  const quote = source[start];
  if (quote !== '"' && quote !== "'") {
    return null;
  }
  let value = "";
  let i = start + 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === "\\") {
      i++;
      if (i < source.length) {
        value += source[i];
        i++;
      }
      continue;
    }
    if (ch === quote) {
      return { value, end: i + 1 };
    }
    value += ch;
    i++;
  }
  return null;
}
function parseKey(source, start) {
  let i = start;
  while (i < source.length && /\s/.test(source[i])) {
    i++;
  }
  if (source[i] === '"' || source[i] === "'") {
    const parsed = parseStringLiteral(source, i);
    return parsed ? { value: parsed.value, end: parsed.end } : null;
  }
  const match = /^[a-zA-Z_$][\w$.-]*/.exec(source.slice(i));
  if (!match) {
    return null;
  }
  return { value: match[0], end: i + match[0].length };
}
function parseValue(source, start) {
  let i = start;
  while (i < source.length && /\s/.test(source[i])) {
    i++;
  }
  if (source[i] === "{") {
    const inner = extractBalancedBlock(source, i);
    if (inner === null) {
      return null;
    }
    const obj = parseObjectLiteral(inner);
    if (obj === null) {
      return null;
    }
    const end = source.indexOf("}", i) + 1;
    return { value: obj, end };
  }
  if (source[i] === '"' || source[i] === "'") {
    const parsed = parseStringLiteral(source, i);
    return parsed ? { value: parsed.value, end: parsed.end } : null;
  }
  return null;
}
function parseObjectLiteral(source) {
  const result = {};
  let i = 0;
  while (i < source.length) {
    while (i < source.length && /\s/.test(source[i])) {
      i++;
    }
    if (i >= source.length) {
      break;
    }
    if (source[i] === "}") {
      break;
    }
    const key = parseKey(source, i);
    if (!key) {
      return null;
    }
    i = key.end;
    while (i < source.length && /\s/.test(source[i])) {
      i++;
    }
    if (source[i] !== ":") {
      return null;
    }
    i++;
    const value = parseValue(source, i);
    if (!value) {
      return null;
    }
    result[key.value] = value.value;
    i = value.end;
    while (i < source.length && /\s/.test(source[i])) {
      i++;
    }
    if (source[i] === ",") {
      i++;
      continue;
    }
    if (source[i] === "}" || i >= source.length) {
      break;
    }
  }
  return result;
}
function toColorScale(obj) {
  const result = {};
  for (const [name, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[name] = value;
      continue;
    }
    const palette = {};
    for (const [shade, hex] of Object.entries(value)) {
      if (typeof hex === "string") {
        palette[shade] = hex;
      }
    }
    if (Object.keys(palette).length > 0) {
      result[name] = palette;
    }
  }
  return result;
}
function toSpacingScale(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}
function parseUnoTheme(content) {
  try {
    const themeMatch = /\btheme:\s*\{/.exec(content);
    if (!themeMatch) {
      return {};
    }
    const themeBraceIndex = content.indexOf("{", themeMatch.index);
    const themeInner = extractBalancedBlock(content, themeBraceIndex);
    if (themeInner === null) {
      return {};
    }
    const result = {};
    const colorsInner = findSectionBlock(themeInner, "colors");
    if (colorsInner !== null) {
      const parsed = parseObjectLiteral(colorsInner);
      if (parsed && Object.keys(parsed).length > 0) {
        result.colors = toColorScale(parsed);
      }
    }
    const spacingInner = findSectionBlock(themeInner, "spacing");
    if (spacingInner !== null) {
      const parsed = parseObjectLiteral(spacingInner);
      if (parsed && Object.keys(parsed).length > 0) {
        result.spacing = toSpacingScale(parsed);
      }
    }
    return result;
  } catch {
    return {};
  }
}
function quoteKey(key) {
  if (/^[a-zA-Z_$][\w$]*$/.test(key)) {
    return key;
  }
  return JSON.stringify(key);
}
function serializeNestedObject(obj, indent) {
  const pad = " ".repeat(indent);
  const innerPad = " ".repeat(indent + 2);
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    lines.push(`${innerPad}${quoteKey(key)}: ${JSON.stringify(value)},`);
  }
  return `${pad}{
${lines.join("\n")}
${pad}}`;
}
function serializeColorScale(colors2, indent) {
  const innerPad = " ".repeat(indent + 2);
  const lines = [];
  for (const [name, value] of Object.entries(colors2)) {
    if (typeof value === "string") {
      lines.push(`${innerPad}${quoteKey(name)}: ${JSON.stringify(value)},`);
      continue;
    }
    lines.push(
      `${innerPad}${quoteKey(name)}: ${serializeNestedObject(value, indent + 2)},`
    );
  }
  return lines.join("\n");
}
function serializeSpacingScale(spacing2, indent) {
  const innerPad = " ".repeat(indent + 2);
  const lines = [];
  for (const [key, value] of Object.entries(spacing2)) {
    lines.push(`${innerPad}${quoteKey(key)}: ${JSON.stringify(value)},`);
  }
  return lines.join("\n");
}
function buildThemeBlock(merged) {
  const colorsBody = serializeColorScale(merged.colors, 6);
  const spacingBody = serializeSpacingScale(merged.spacing, 6);
  return `  theme: {
    colors: {
${colorsBody}
    },
    spacing: {
${spacingBody}
    },
  },`;
}
function replaceThemeBlock(content, themeBlock) {
  const match = /\btheme:\s*\{/.exec(content);
  if (!match) {
    return content;
  }
  const braceStart = content.indexOf("{", match.index);
  let depth = 0;
  let endIndex = -1;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === "{") {
      depth++;
    } else if (content[i] === "}") {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }
  if (endIndex === -1) {
    return content;
  }
  let replaceEnd = endIndex + 1;
  const trailing = content.slice(replaceEnd).match(/^\s*,?/);
  if (trailing) {
    replaceEnd += trailing[0].length;
  }
  return content.slice(0, match.index) + themeBlock + content.slice(replaceEnd);
}
function patchUnoConfig(content, merged) {
  const themeBlock = buildThemeBlock(merged);
  if (/\btheme:\s*\{/.test(content)) {
    return replaceThemeBlock(content, themeBlock);
  }
  return content.replace(/defineConfig\(\{/, `defineConfig({
${themeBlock}`);
}
const _hoisted_1$3 = { class: "flex flex-1 min-h-0 gap-3" };
const _hoisted_2$3 = { class: "w-28 shrink-0 overflow-y-auto border border-gray-200 rounded" };
const _hoisted_3$3 = ["data-testid", "onClick"];
const _hoisted_4$3 = { class: "flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto" };
const _hoisted_5$3 = ["data-testid"];
const _hoisted_6$3 = { class: "text-xs text-gray-500 w-8 font-mono" };
const _hoisted_7$2 = ["value", "onInput"];
const _hoisted_8$2 = ["value", "onChange"];
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ThemeColorsPanel",
  props: {
    colors: {},
    defaultColors: {},
    selectedPalette: {}
  },
  emits: ["update:colors", "update:selectedPalette"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const palettes = computed(
      () => listColorPalettes({ colors: props.colors })
    );
    const shadeKeys = computed(() => {
      const def = props.defaultColors[props.selectedPalette];
      if (typeof def === "object" && def !== null && "50" in def) {
        return [...COLOR_SHADES];
      }
      const keys = /* @__PURE__ */ new Set();
      if (typeof def === "object" && def) {
        for (const k of Object.keys(def)) keys.add(k);
      }
      const cur = props.colors[props.selectedPalette];
      if (typeof cur === "object" && cur) {
        for (const k of Object.keys(cur)) keys.add(k);
      }
      return [...keys].sort();
    });
    function paletteValue(shade) {
      const cur = props.colors[props.selectedPalette];
      if (typeof cur === "object" && cur?.[shade]) {
        return cur[shade];
      }
      const def = props.defaultColors[props.selectedPalette];
      if (typeof def === "object" && def?.[shade]) {
        return def[shade];
      }
      return "#000000";
    }
    function updateShade(shade, hex) {
      const name = props.selectedPalette;
      const current = props.colors[name];
      const base = typeof current === "object" && current !== null ? { ...current } : typeof props.defaultColors[name] === "object" ? { ...props.defaultColors[name] } : {};
      base[shade] = hex;
      emit("update:colors", { ...props.colors, [name]: base });
    }
    function resetPalette() {
      const name = props.selectedPalette;
      const def = props.defaultColors[name];
      const next = { ...props.colors };
      if (def === void 0) {
        delete next[name];
      } else if (typeof def === "string") {
        next[name] = def;
      } else {
        next[name] = { ...def };
      }
      emit("update:colors", next);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createBaseVNode("nav", _hoisted_2$3, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(palettes.value, (name) => {
            return openBlock(), createElementBlock("button", {
              key: name,
              type: "button",
              class: normalizeClass(["block w-full text-left text-xs px-2 py-1.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50", name === __props.selectedPalette ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"]),
              "data-testid": `palette-${name}`,
              onClick: ($event) => emit("update:selectedPalette", name)
            }, toDisplayString(name), 11, _hoisted_3$3);
          }), 128))
        ]),
        createBaseVNode("div", _hoisted_4$3, [
          createBaseVNode("div", { class: "flex items-center justify-end" }, [
            createBaseVNode("button", {
              type: "button",
              class: "text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50",
              "data-testid": "reset-palette",
              onClick: resetPalette
            }, " Reset palette ")
          ]),
          (openBlock(true), createElementBlock(Fragment, null, renderList(shadeKeys.value, (shade) => {
            return openBlock(), createElementBlock("div", {
              key: shade,
              class: "flex items-center gap-2",
              "data-testid": `shade-${shade}`
            }, [
              createBaseVNode("span", _hoisted_6$3, toDisplayString(shade), 1),
              createBaseVNode("input", {
                type: "color",
                class: "w-8 h-7 rounded border border-gray-300 cursor-pointer shrink-0",
                value: paletteValue(shade),
                onInput: ($event) => updateShade(shade, $event.target.value)
              }, null, 40, _hoisted_7$2),
              createBaseVNode("input", {
                type: "text",
                class: "flex-1 text-xs px-2 py-1 border border-gray-300 rounded font-mono",
                value: paletteValue(shade),
                onChange: ($event) => updateShade(shade, $event.target.value)
              }, null, 40, _hoisted_8$2)
            ], 8, _hoisted_5$3);
          }), 128))
        ])
      ]);
    };
  }
});
const _hoisted_1$2 = { class: "flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto" };
const _hoisted_2$2 = { class: "grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2" };
const _hoisted_3$2 = ["data-testid"];
const _hoisted_4$2 = { class: "text-xs text-gray-700 w-24 shrink-0" };
const _hoisted_5$2 = ["value", "onInput"];
const _hoisted_6$2 = ["value", "onChange"];
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ThemeSemanticPanel",
  props: {
    colors: {},
    defaultColors: {}
  },
  emits: ["update:colors"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    function tokenValue(key) {
      const current = props.colors[SEMANTIC_PALETTE];
      if (typeof current === "object" && current?.[key]) {
        return current[key];
      }
      const def = props.defaultColors[SEMANTIC_PALETTE];
      if (typeof def === "object" && def?.[key]) {
        return def[key];
      }
      return "#000000";
    }
    function updateToken(key, hex) {
      const current = props.colors[SEMANTIC_PALETTE];
      const def = props.defaultColors[SEMANTIC_PALETTE];
      const base = typeof current === "object" && current !== null ? { ...current } : typeof def === "object" && def !== null ? { ...def } : {};
      base[key] = hex;
      emit("update:colors", { ...props.colors, [SEMANTIC_PALETTE]: base });
    }
    function resetSemantic() {
      const def = props.defaultColors[SEMANTIC_PALETTE];
      const next = { ...props.colors };
      if (typeof def === "object" && def !== null) {
        next[SEMANTIC_PALETTE] = { ...def };
      } else {
        delete next[SEMANTIC_PALETTE];
      }
      emit("update:colors", next);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", { class: "flex items-center justify-between shrink-0" }, [
          _cache[0] || (_cache[0] = createBaseVNode("p", { class: "text-xs text-gray-500" }, [
            createTextVNode(" 语义主题色 → UnoCSS "),
            createBaseVNode("code", { class: "font-mono text-[10px]" }, "bg-brand-*")
          ], -1)),
          createBaseVNode("button", {
            type: "button",
            class: "text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50",
            "data-testid": "reset-semantic",
            onClick: resetSemantic
          }, " 重置主题色 ")
        ]),
        createBaseVNode("div", _hoisted_2$2, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(SEMANTIC_TOKEN_DEFS), (token) => {
            return openBlock(), createElementBlock("label", {
              key: token.key,
              class: "flex items-center gap-2",
              "data-testid": `semantic-${token.key}`
            }, [
              createBaseVNode("span", _hoisted_4$2, toDisplayString(token.label), 1),
              createBaseVNode("input", {
                type: "color",
                class: "w-8 h-7 rounded border border-gray-300 cursor-pointer shrink-0",
                value: tokenValue(token.key),
                onInput: ($event) => updateToken(token.key, $event.target.value)
              }, null, 40, _hoisted_5$2),
              createBaseVNode("input", {
                type: "text",
                class: "flex-1 min-w-0 text-xs px-2 py-1 border border-gray-300 rounded font-mono",
                value: tokenValue(token.key),
                onChange: ($event) => updateToken(token.key, $event.target.value)
              }, null, 40, _hoisted_6$2)
            ], 8, _hoisted_3$2);
          }), 128))
        ])
      ]);
    };
  }
});
const _hoisted_1$1 = { class: "flex-1 min-h-0 overflow-y-auto border border-gray-200 rounded" };
const _hoisted_2$1 = { class: "w-full text-xs" };
const _hoisted_3$1 = ["data-testid"];
const _hoisted_4$1 = { class: "px-3 py-1.5 font-mono text-gray-700" };
const _hoisted_5$1 = { class: "px-3 py-1.5" };
const _hoisted_6$1 = ["value", "onChange"];
const _hoisted_7$1 = { class: "px-3 py-1.5 text-right" };
const _hoisted_8$1 = ["onClick"];
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ThemeSpacingPanel",
  props: {
    spacing: {},
    defaultSpacing: {}
  },
  emits: ["update:spacing"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const keys = computed(() => sortSpacingKeys(Object.keys(props.spacing)));
    function updateKey(key, value) {
      emit("update:spacing", { ...props.spacing, [key]: value });
    }
    function resetKey(key) {
      const def = props.defaultSpacing[key];
      if (def !== void 0) {
        emit("update:spacing", { ...props.spacing, [key]: def });
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("table", _hoisted_2$1, [
          _cache[0] || (_cache[0] = createBaseVNode("thead", { class: "bg-gray-50 sticky top-0" }, [
            createBaseVNode("tr", null, [
              createBaseVNode("th", { class: "text-left px-3 py-2 font-medium text-gray-500 border-b border-gray-200 w-24" }, " Key "),
              createBaseVNode("th", { class: "text-left px-3 py-2 font-medium text-gray-500 border-b border-gray-200" }, " Value "),
              createBaseVNode("th", { class: "text-right px-3 py-2 font-medium text-gray-500 border-b border-gray-200 w-20" }, " Reset ")
            ])
          ], -1)),
          createBaseVNode("tbody", null, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(keys.value, (key) => {
              return openBlock(), createElementBlock("tr", {
                key,
                class: "border-b border-gray-100 last:border-b-0 hover:bg-gray-50",
                "data-testid": `spacing-row-${key}`
              }, [
                createBaseVNode("td", _hoisted_4$1, toDisplayString(key), 1),
                createBaseVNode("td", _hoisted_5$1, [
                  createBaseVNode("input", {
                    type: "text",
                    class: "w-full text-xs px-2 py-1 border border-gray-300 rounded font-mono",
                    value: __props.spacing[key],
                    onChange: ($event) => updateKey(key, $event.target.value)
                  }, null, 40, _hoisted_6$1)
                ]),
                createBaseVNode("td", _hoisted_7$1, [
                  createBaseVNode("button", {
                    type: "button",
                    class: "text-xs text-gray-500 hover:text-gray-800",
                    onClick: ($event) => resetKey(key)
                  }, " Reset ", 8, _hoisted_8$1)
                ])
              ], 8, _hoisted_3$1);
            }), 128))
          ])
        ])
      ]);
    };
  }
});
const _hoisted_1 = { class: "flex flex-1 min-h-0 flex-col p-4 gap-3 overflow-hidden" };
const _hoisted_2 = { class: "flex items-center gap-2 shrink-0" };
const _hoisted_3 = { class: "text-xs text-gray-400" };
const _hoisted_4 = ["disabled"];
const _hoisted_5 = { class: "flex gap-1 shrink-0 border-b border-gray-200" };
const _hoisted_6 = {
  key: 0,
  class: "text-xs text-red-600 bg-red-50 px-3 py-2 rounded shrink-0"
};
const _hoisted_7 = {
  key: 1,
  class: "text-xs text-green-700 bg-green-50 px-3 py-2 rounded shrink-0"
};
const _hoisted_8 = {
  key: 2,
  class: "text-sm text-gray-400"
};
const _hoisted_9 = { class: "shrink-0 border border-gray-200 rounded p-3 bg-gray-50" };
const _hoisted_10 = {
  key: 0,
  class: "flex flex-wrap gap-2"
};
const _hoisted_11 = ["title"];
const _hoisted_12 = { class: "text-[10px] text-gray-500" };
const _hoisted_13 = {
  key: 1,
  class: "flex flex-wrap gap-1"
};
const _hoisted_14 = ["title"];
const _hoisted_15 = { class: "text-[10px] text-gray-400 font-mono" };
const _hoisted_16 = {
  key: 2,
  class: "flex items-end gap-4"
};
const _hoisted_17 = { class: "text-[10px] text-gray-400 font-mono" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StyleTokensEditorWidget",
  props: {
    api: {},
    preset: {},
    target: {},
    themeFile: {}
  },
  setup(__props) {
    const props = __props;
    const activeTab = ref("semantic");
    const theme = ref(deepMergeTheme(DEFAULT_THEME));
    const selectedPalette = ref("blue");
    const loading = ref(false);
    const saving = ref(false);
    const error = ref(null);
    const saveMessage = ref(null);
    const semanticPreviewTokens = computed(
      () => SEMANTIC_TOKEN_DEFS.filter(
        (t) => ["primary", "secondary", "accent", "background", "foreground", "destructive"].includes(t.key)
      ).map((t) => ({
        key: t.key,
        label: t.label,
        hex: (() => {
          const brand = theme.value.colors[SEMANTIC_PALETTE];
          if (typeof brand === "object" && brand?.[t.key]) return brand[t.key];
          const def = DEFAULT_THEME.colors[SEMANTIC_PALETTE];
          if (typeof def === "object" && def?.[t.key]) return def[t.key];
          return "#ccc";
        })()
      }))
    );
    const previewShades = computed(() => {
      const name = selectedPalette.value;
      const val = theme.value.colors[name];
      if (typeof val !== "object" || val === null) return [];
      const def = DEFAULT_THEME.colors[name];
      const isStandard = typeof def === "object" && def !== null && "500" in def;
      const keys = isStandard ? [...COLOR_SHADES] : Object.keys(val);
      return keys.map((shade) => ({
        shade,
        hex: val[shade] ?? (typeof def === "object" ? def[shade] : "") ?? "#ccc"
      }));
    });
    const previewSpacingKeys = computed(() => {
      const all = sortSpacingKeys(Object.keys(theme.value.spacing));
      const picks = ["1", "2", "4", "8"].filter((k) => all.includes(k));
      return picks.length > 0 ? picks : all.slice(0, 4);
    });
    function jsonPath() {
      return props.themeFile ?? ".agentflow/theme-tokens.json";
    }
    function onColorsUpdate(colors2) {
      theme.value = { ...theme.value, colors: colors2 };
    }
    function onSpacingUpdate(spacing2) {
      theme.value = { ...theme.value, spacing: spacing2 };
    }
    async function loadTokens() {
      loading.value = true;
      error.value = null;
      saveMessage.value = null;
      let sidecar = migrateLegacyTokens(null);
      try {
        const file = await props.api.readWorkspaceFile(jsonPath());
        sidecar = migrateLegacyTokens(JSON.parse(file.content));
      } catch {
      }
      let unoTheme = {};
      if (props.preset === "unocss") {
        try {
          const file = await props.api.readWorkspaceFile(props.target);
          unoTheme = parseUnoTheme(file.content);
        } catch {
        }
      }
      theme.value = deepMergeTheme(DEFAULT_THEME, unoTheme, {
        colors: sidecar.colors,
        spacing: sidecar.spacing
      });
      const palettes = listColorPalettes(theme.value);
      if (!palettes.includes(selectedPalette.value)) {
        selectedPalette.value = palettes.includes("blue") ? "blue" : palettes[0] ?? "blue";
      }
      loading.value = false;
    }
    async function saveTokens() {
      saving.value = true;
      error.value = null;
      saveMessage.value = null;
      try {
        const overrides = diffOverrides(theme.value, DEFAULT_THEME);
        await props.api.writeWorkspaceFile(
          jsonPath(),
          JSON.stringify(overrides, null, 2)
        );
        if (props.preset === "unocss") {
          try {
            const file = await props.api.readWorkspaceFile(props.target);
            const patched = patchUnoConfig(file.content, theme.value);
            await props.api.writeWorkspaceFile(props.target, patched);
            saveMessage.value = `Saved ${jsonPath()} and patched ${props.target}`;
          } catch {
            saveMessage.value = `Saved ${jsonPath()} (config patch skipped)`;
          }
        } else {
          saveMessage.value = `Saved ${jsonPath()}`;
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        saving.value = false;
      }
    }
    onMounted(() => {
      void loadTokens();
    });
    watch(
      () => [props.target, props.themeFile, props.preset],
      () => {
        void loadTokens();
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("header", _hoisted_2, [
          _cache[4] || (_cache[4] = createBaseVNode("h2", { class: "text-sm font-semibold text-gray-800" }, "Theme Scale", -1)),
          createBaseVNode("span", _hoisted_3, toDisplayString(__props.preset) + " → " + toDisplayString(__props.themeFile ?? __props.target), 1),
          createBaseVNode("button", {
            class: "ml-auto text-xs px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50",
            disabled: saving.value || loading.value,
            "data-testid": "save-tokens",
            onClick: saveTokens
          }, toDisplayString(saving.value ? "Saving…" : "Save"), 9, _hoisted_4)
        ]),
        createBaseVNode("div", _hoisted_5, [
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass(["text-xs px-3 py-1.5 -mb-px border-b-2", activeTab.value === "semantic" ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"]),
            "data-testid": "theme-tab-semantic",
            onClick: _cache[0] || (_cache[0] = ($event) => activeTab.value = "semantic")
          }, " 主题色 ", 2),
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass(["text-xs px-3 py-1.5 -mb-px border-b-2", activeTab.value === "colors" ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"]),
            "data-testid": "theme-tab-colors",
            onClick: _cache[1] || (_cache[1] = ($event) => activeTab.value = "colors")
          }, " 色板 ", 2),
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass(["text-xs px-3 py-1.5 -mb-px border-b-2", activeTab.value === "spacing" ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"]),
            "data-testid": "theme-tab-spacing",
            onClick: _cache[2] || (_cache[2] = ($event) => activeTab.value = "spacing")
          }, " Spacing ", 2)
        ]),
        error.value ? (openBlock(), createElementBlock("p", _hoisted_6, toDisplayString(error.value), 1)) : createCommentVNode("", true),
        saveMessage.value ? (openBlock(), createElementBlock("p", _hoisted_7, toDisplayString(saveMessage.value), 1)) : createCommentVNode("", true),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_8, "Loading theme…")) : (openBlock(), createElementBlock(Fragment, { key: 3 }, [
          activeTab.value === "semantic" ? (openBlock(), createBlock(_sfc_main$2, {
            key: 0,
            colors: theme.value.colors,
            "default-colors": unref(DEFAULT_THEME).colors,
            "onUpdate:colors": onColorsUpdate
          }, null, 8, ["colors", "default-colors"])) : activeTab.value === "colors" ? (openBlock(), createBlock(_sfc_main$3, {
            key: 1,
            colors: theme.value.colors,
            "default-colors": unref(DEFAULT_THEME).colors,
            "selected-palette": selectedPalette.value,
            "onUpdate:colors": onColorsUpdate,
            "onUpdate:selectedPalette": _cache[3] || (_cache[3] = ($event) => selectedPalette.value = $event)
          }, null, 8, ["colors", "default-colors", "selected-palette"])) : (openBlock(), createBlock(_sfc_main$1, {
            key: 2,
            spacing: theme.value.spacing,
            "default-spacing": unref(DEFAULT_THEME).spacing,
            "onUpdate:spacing": onSpacingUpdate
          }, null, 8, ["spacing", "default-spacing"])),
          createBaseVNode("div", _hoisted_9, [
            _cache[6] || (_cache[6] = createBaseVNode("p", { class: "text-xs text-gray-500 mb-2" }, "Preview", -1)),
            activeTab.value === "semantic" ? (openBlock(), createElementBlock("div", _hoisted_10, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(semanticPreviewTokens.value, ({ key, label, hex }) => {
                return openBlock(), createElementBlock("div", {
                  key,
                  class: "flex flex-col items-center gap-0.5",
                  title: `brand-${key}`
                }, [
                  createBaseVNode("div", {
                    class: "w-10 h-10 rounded border border-gray-200",
                    style: normalizeStyle({ backgroundColor: hex })
                  }, null, 4),
                  createBaseVNode("span", _hoisted_12, toDisplayString(label), 1)
                ], 8, _hoisted_11);
              }), 128))
            ])) : activeTab.value === "colors" ? (openBlock(), createElementBlock("div", _hoisted_13, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(previewShades.value, ({ shade, hex }) => {
                return openBlock(), createElementBlock("div", {
                  key: shade,
                  class: "flex flex-col items-center gap-0.5",
                  title: `${selectedPalette.value}-${shade}`
                }, [
                  createBaseVNode("div", {
                    class: "w-8 h-8 rounded border border-gray-200",
                    style: normalizeStyle({ backgroundColor: hex })
                  }, null, 4),
                  createBaseVNode("span", _hoisted_15, toDisplayString(shade), 1)
                ], 8, _hoisted_14);
              }), 128))
            ])) : (openBlock(), createElementBlock("div", _hoisted_16, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(previewSpacingKeys.value, (key) => {
                return openBlock(), createElementBlock("div", {
                  key,
                  class: "flex flex-col items-center gap-1"
                }, [
                  createBaseVNode("div", {
                    class: "bg-white border border-gray-300 rounded",
                    style: normalizeStyle({ padding: theme.value.spacing[key] })
                  }, [..._cache[5] || (_cache[5] = [
                    createBaseVNode("div", { class: "w-6 h-6 bg-blue-200 rounded-sm" }, null, -1)
                  ])], 4),
                  createBaseVNode("span", _hoisted_17, "p-" + toDisplayString(key), 1)
                ]);
              }), 128))
            ]))
          ])
        ], 64))
      ]);
    };
  }
});
export {
  _sfc_main as default
};
