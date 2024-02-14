<script lang="ts">
    import type { SpellsItem, TraitsItem } from "types/layout";
    import { slugify } from "src/util/util";
    import TextContent from "./TextContent.svelte";

    import TextContentHolder from "./TextContentHolder.svelte";
    import type { Monster, Trait } from "index";
    import { Notice } from "obsidian";

    export let trait: Trait;

    export let name: string;
    export let desc: string;
    export let property: string = "";
    export let render: boolean = false;
    export let item: TraitsItem | SpellsItem;
    export let monster: Monster;
    if (item.callback) {
        try {
            const frame = document.body.createEl("iframe");
            const funct = (frame.contentWindow as any).Function;
            const func = new funct("monster", item.callback);
            desc = func.call(undefined, monster) ?? desc;
            document.body.removeChild(frame);
        } catch (e) {
            new Notice(
                `There was an error executing the provided callback for [${item.properties.join(
                    ", "
                )}]\n\n${e.message}`
            );
            console.error(e);
        }
    }

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
    {#if trait?.traits}
        <div class="statblock-nested-traits">
            {#each trait.traits as nested}
                <svelte:self
                    name={nested.name}
                    desc={nested.desc}
                    {property}
                    {render}
                    {item}
                    {nested}
                />
            {/each}
        </div>
    {/if}
</div>

<style>
    .property-name {
        margin: 0;
        margin-right: 0.25em;
        display: inline;
        font-weight: var(--active--traits-font-weight);
        font-style: var(--active--traits-font-style);
    }
    .statblock-nested-traits {
        margin-left: 1rem;
    }
</style>
