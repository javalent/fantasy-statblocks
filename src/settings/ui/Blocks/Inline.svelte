<script lang="ts">
    import type { InlineItem } from "src/data/constants";
    import Creator from "../Creator.svelte";

    export let block: InlineItem;
</script>

<div class="group">
    <Creator blocks={block.nested} inline={true} />
</div>

<style>
</style>
