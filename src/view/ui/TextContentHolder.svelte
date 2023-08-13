<script lang="ts">
    import DiceHolder from "./DiceHolder.svelte";
    import MarkdownHolder from "./MarkdownHolder.svelte";

    export let property: string = "";
    export let render: boolean = false;
</script>

{#if render}
    <MarkdownHolder {property} />
{:else}
    <DiceHolder {property} />
{/if}
