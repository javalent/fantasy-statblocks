<script lang="ts">
    import type { InlineItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import { createEventDispatcher } from "svelte";
    import AddButton from "../AddButton.svelte";

    import Creator from "../Creator.svelte";

    const dispatch = createEventDispatcher();
    export let block: InlineItem;
    export let plugin: StatBlockPlugin;
</script>

<div class="group">
    <Creator blocks={block.nested} inline={true} {plugin} on:edit />

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
