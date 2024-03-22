<script lang="ts">
    import { CSSPropertyGroups } from "src/layouts/layout.types";
    import { getContext, setContext } from "../context";
    import Group from "./Group.svelte";
    import { writable } from "svelte/store";
    import { setNodeIcon } from "src/util";

    const layout = getContext("layout");
    const mode = writable<"light" | "dark" | null>(null);
    setContext("mode", mode);
</script>

<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item-name">Select mode</div>
    </div>
    <div class="setting-item-control">
        <button
            use:setNodeIcon={"sun-moon"}
            aria-label="Global"
            class:mod-cta={$mode == null}
            on:click={() => ($mode = null)}
        ></button>
        <button
            use:setNodeIcon={"sun"}
            aria-label="Light"
            class:mod-cta={$mode == "light"}
            on:click={() => ($mode = "light")}
        ></button>
        <button
            use:setNodeIcon={"moon"}
            aria-label="Dark"
            class:mod-cta={$mode == "dark"}
            on:click={() => ($mode = "dark")}
        ></button>
    </div>
</div>
{#each CSSPropertyGroups as group}
    <Group {group} />
{/each}

<style scoped>
</style>
