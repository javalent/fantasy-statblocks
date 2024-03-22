import type StatBlockPlugin from "src/main";
import { getContext as gC, setContext as sC } from "svelte";
import type { Writable } from "svelte/store";
import type { Layout } from "src/layouts/layout.types";

interface LayoutEditorContext {
    layout: Writable<Layout>;
    plugin: StatBlockPlugin;
    previewed: string | null;
    mode: Writable<"light" | "dark" | null>;
}

export function getContext<K extends keyof LayoutEditorContext>(key: K) {
    return gC<LayoutEditorContext[K]>(key);
}
export function setContext<K extends keyof LayoutEditorContext>(
    key: K,
    value: LayoutEditorContext[K]
) {
    return sC(key, value);
}
