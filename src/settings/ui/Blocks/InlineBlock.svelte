<script lang="ts">
    import type { InlineItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";

    import Creator from "../Creator.svelte";

    export let block: InlineItem;
    export let plugin: StatBlockPlugin;
</script>

<div class="group">
    <Creator blocks={block.nested} inline={true} {plugin} />
</div>

<style>
</style>
