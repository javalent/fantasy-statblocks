<script lang="ts">
    import type { SpellsItem, TraitsItem } from "src/layouts/types";
    import { slugify } from "src/util/util";
    import TextContent from "./TextContent.svelte";

    import TextContentHolder from "./TextContentHolder.svelte";

    export let name: string;
    export let desc: string;
    export let property: string = "";
    export let render: boolean = false;
    export let item: TraitsItem | SpellsItem;

    $: cssClasses = item.doNotAddClass
        ? []
        : [slugify(name), slugify(property)].join(" ");
</script>

<div class="property {cssClasses}">
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
