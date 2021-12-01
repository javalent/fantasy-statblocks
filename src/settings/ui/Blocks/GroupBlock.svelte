<script lang="ts">
    import type { GroupItem, StatblockItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import Creator from "../Creator.svelte";

    export let block: GroupItem;
    export let plugin: StatBlockPlugin;

    const handleSorted = (e: CustomEvent<StatblockItem[]>) => {
        block.nested = [...e.detail];
    };
</script>

<div class="group">
    <Creator
        blocks={block.nested}
        {plugin}
        on:sorted={handleSorted}
        dropFromOthersDisabled={true}
    />
</div>

<style>
    .group {
        border: 2px dashed grey;
    }
</style>
