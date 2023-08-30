<script lang="ts">
    import type { Monster } from "types";
    import { Notice } from "obsidian";
    import type { PropertyItem } from "types/layout";
    import { slugify, stringify } from "src/util/util";
    import TextContentHolder from "./TextContentHolder.svelte";

    export let monster: Monster;
    export let item: PropertyItem;

    let property = stringify(monster[item.properties[0]]);
    let display = item.display ?? item.properties[0];

    if (item.callback) {
        try {
            const frame = document.body.createEl("iframe");
            const funct = (frame.contentWindow as any).Function;
            const func = new funct("monster", item.callback);
            property = func.call(undefined, monster) ?? property;
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
    if (!item.conditioned && !`${property}`.length) {
        property = item.fallback ?? "-";
    }

    $: cssClass = item.doNotAddClass ? "" : slugify(item.properties[0]);
</script>

{#if !item.conditioned || (item.conditioned && `${property}`.length)}
    <div class="statblock-property-block {cssClass}">
        <span class="property-trait-name">{display}</span>
        <TextContentHolder render={item.markdown} {property} />
    </div>
{/if}

<style>
    .statblock-property-block {
        line-height: var(--statblock-property-line-height);
        display: block;
        color: var(--statblock-property-font-color);
    }
    .property-trait-name {
        margin: 0;
        margin-right: 0.25em;
        display: inline;
        color: var(--statblock-property-name-font-color);
        font-weight: var(--statblock-property-name-font-weight);
    }
</style>
