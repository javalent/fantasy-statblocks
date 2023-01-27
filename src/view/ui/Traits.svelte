<script lang="ts">
    import { slugify } from "src/util/util";
    import TextContent from "./TextContent.svelte";

    import TextContentHolder from "./TextContentHolder.svelte";

    export let name: string;
    console.log("🚀 ~ file: Traits.svelte:7 ~ name", name);
    export let desc: string;
    console.log("🚀 ~ file: Traits.svelte:9 ~ desc", desc);
    export let render: boolean = false;
</script>

<div class="property {slugify(name)}">
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
        font-weight: var(--statblock-traits-font-weight);
        font-style: var(--statblock-traits-font-style);
    }
</style>
