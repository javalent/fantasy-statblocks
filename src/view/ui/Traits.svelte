<script lang="ts">
    import TextContentHolder from "./TextContentHolder.svelte";

    export let name: string;
    export let desc: string;
    export let render: boolean = false;
</script>

<div class="property">
    {#if name}
        <div class="property-name">{name}</div>
    {/if}
    <div class="property-text">
        <TextContentHolder {render} property={desc} />
    </div>
</div>

<style>
    .property-text {
        display: inline;
        white-space: pre-line;
        text-indent: 0;
    }
    .property-name {
        margin: 0;
        margin-right: 0.25em;
        display: inline;
        font-weight: bold;
        font-style: italic;
    }
</style>
