<script lang="ts">
    import type {
        GroupItem,
        InlineItem,
        StatblockItem
    } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import Creator from "../Creator.svelte";

    export let block: GroupItem | InlineItem;
    export let plugin: StatBlockPlugin;
    export let inline: boolean;

    $: blocks = block.nested;

    const handleSorted = (e: CustomEvent<StatblockItem[]>) => {
        block.nested = [...e.detail];
    };
</script>

<div class="group" class:inline-group={inline}>
    <Creator {blocks} {plugin} {inline} on:sorted={handleSorted} on:added />
</div>

<style>
    .group {
        display: grid;
        grid-template-columns: 1fr;
        border: 2px dashed grey;
        min-height: 2rem;
    }
</style>
