<script lang="ts">
    import DiceHolder from "./DiceHolder.svelte";
    import MarkdownHolder from "./MarkdownHolder.svelte";

    export let property: string = "";
</script>

<!-- {#if render} -->
    <MarkdownHolder {property} />
<!-- {:else}
    <DiceHolder {property} />
{/if} -->
