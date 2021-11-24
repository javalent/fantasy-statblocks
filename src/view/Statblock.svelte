<script lang="ts">
    import type { Monster } from "@types";
    import { debounce } from "obsidian";
    import type { StatblockItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import { onDestroy, onMount, setContext } from "svelte";

    import Bar from "./ui/Bar.svelte";
    import Content from "./ui/Content.svelte";

    export let monster: Monster;
    export let plugin: StatBlockPlugin;
    export let statblock: StatblockItem[];
    export let canSave: boolean;
    export let canExport: boolean;

    setContext<StatBlockPlugin>("plugin", plugin);

    let container: HTMLElement;
    let columns: number = 1;
    let ready = false;
    const onResize = debounce(
        () => {
            const width = container.clientWidth;
            columns = Math.max(Math.floor(width / 400), 1);
            if (!ready) ready = true;
        },
        100,
        false
    );
    const observer = new ResizeObserver(onResize);

    onMount(() => {
        const width = container.clientWidth;
        columns = Math.max(Math.min(Math.floor(width / 400), 2), 1);
        observer.observe(container);
    });

    onDestroy(() => {
        observer.disconnect();
    });
</script>

<div class="container" bind:this={container}>
    {#if ready}
        <div class="obsidian-statblock-plugin statblock">
            {#if monster}
                <Bar />

                {#key columns}
                    <Content
                        {monster}
                        {columns}
                        {statblock}
                        {ready}
                        {canSave}
                        {canExport}
                        on:save
                        on:export
                    />
                {/key}
                <Bar />
            {:else}
                <span>Invalid monster.</span>
            {/if}
        </div>
    {/if}
</div>

<style>
    .container {
        display: flex;
        width: 100%;
        margin: 0.25rem 0;
    }
    .statblock {
        margin: 0 auto;
    }
</style>
