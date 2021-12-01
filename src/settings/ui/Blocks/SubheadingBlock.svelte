<script lang="ts">
    import type { SubHeadingItem } from "src/data/constants";

    import type StatBlockPlugin from "src/main";

    export let block: SubHeadingItem;
    export let plugin: StatBlockPlugin;
</script>

<div class="subheading">Subheading</div>

<style>
    .subheading {
        font-weight: normal;
        font-style: italic;
        font-size: 12px;
        margin: 0;
    }
</style>
