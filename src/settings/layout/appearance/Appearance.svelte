<script lang="ts">
    import { CSSPropertyGroups } from "src/layouts/layout.types";
    import { getContext } from "../context";
    import Group from "./Group.svelte";

    const layout = getContext("layout");
</script>

{#each CSSPropertyGroups as group}
    <Group {group} />
{/each}

<style scoped>
</style>
