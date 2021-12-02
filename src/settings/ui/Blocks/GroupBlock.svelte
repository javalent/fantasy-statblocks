<script lang="ts">
    import type { GroupItem, StatblockItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import { createEventDispatcher } from "svelte";
    import AddButton from "../AddButton.svelte";
    import Creator from "../Creator.svelte";

    const dispatch = createEventDispatcher();

    export let block: GroupItem;
    export let plugin: StatBlockPlugin;

    const handleSorted = (e: CustomEvent<StatblockItem[]>) => {
        block.nested = [...e.detail];
    };
</script>

<div class="group">
    <Creator blocks={block.nested} {plugin} on:sorted={handleSorted} on:edit />

    <AddButton
        {plugin}
        on:add={(e) => dispatch("add", { type: e.detail, block })}
    />
</div>

<style>
    .group {
        display: grid;
        grid-template-columns: 1fr auto;
        border: 2px dashed grey;
        min-height: 2rem;
    }
</style>
