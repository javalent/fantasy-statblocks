<script lang="ts">
    import type { Monster } from "@types";
    import type StatBlockPlugin from "src/main";
    import { setContext } from "svelte";

    import Bar from "./ui/Bar.svelte";
    import Content from "./ui/Content.svelte";

    export let monster: Monster;
    export let plugin: StatBlockPlugin;

    setContext<StatBlockPlugin>("plugin", plugin);
</script>

<div class="obsidian-statblock-plugin statblock">
    {#if monster}
        <Bar />
        <Content {monster} />
        <Bar />
    {:else}
        <span>Invalid monster.</span>
    {/if}
</div>

<style>
    .statblock {
        max-width: 404px;
    }
</style>
