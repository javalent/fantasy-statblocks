<script lang="ts">
    import TextContent from "./TextContent.svelte";

    import TextContentHolder from "./TextContentHolder.svelte";

    export let name: string;
    export let desc: string;
    export let render: boolean = false;
</script>

<div class="property">
    {#if name}
        <div class="property-name">
            <TextContent textToRender={name} />
        </div>
    {/if}

    <TextContentHolder {render} property={desc} />
</div>

<style>
    .property-name {
        margin: 0;
        margin-right: 0.25em;
        display: inline;
        font-weight: bold;
        font-style: italic;
    }
</style>
