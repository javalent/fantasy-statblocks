<script lang="ts">
    import type { Monster } from "@types";
    import { Notice } from "obsidian";
    import type { PropertyItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import { getContext } from "svelte";

    import DiceHolder from "./DiceHolder.svelte";

    export let monster: Monster;
    export let item: PropertyItem;

    const plugin = getContext<StatBlockPlugin>("plugin");

    let property = monster[item.properties[0]] as string;
    let display = item.display ?? item.properties[0];

    if (item.callback) {
        const func = new Function("monster", "plugin", item.callback);
        try {
            property = func.call(undefined, monster, plugin) ?? property;
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
        property = "-";
    }
</script>

{#if !item.conditioned || (item.conditioned && `${property}`.length)}
    <div class="line">
        <span class="property-name">{display}</span>
        <DiceHolder {property} />
    </div>
{/if}

<style>
    .line {
        line-height: 1.4;
        display: block;
        color: var(--statblock-primary-color);
    }
    .property-name {
        margin: 0;
        margin-right: 0.25em;
        display: inline;
        font-weight: bold;
    }
</style>
