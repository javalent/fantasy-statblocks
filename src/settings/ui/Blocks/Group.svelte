<script lang="ts">
    import type { GroupItem } from "src/data/constants";
    import Creator from "../Creator.svelte";

    export let block: GroupItem;
</script>

<div class="group">
    <Creator blocks={block.nested} />
</div>

<style>
    .group {
        border: 2px dashed grey;
    }
</style>
