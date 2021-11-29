<script lang="ts">
    import type { Monster } from "@types";
    import type { PropertyItem, StatblockItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import { getContext } from "svelte";
    import DiceRoll from "./DiceRoll.svelte";
    import { traitBuilder } from "./helpers";

    export let monster: Monster;
    export let item: PropertyItem;

    const plugin = getContext<StatBlockPlugin>("plugin");

    let property = monster[item.properties[0]] as string;
    let display = item.display ?? item.properties[0];

    if (item.callback) {
        property = item.callback(monster) ?? property;
    }
    let dice = false,
        parse = item.dice?.parse,
        def: number,
        text: string;
    if (item.dice) {
        if (
            item.dice.conditioned &&
            item.dice.text &&
            item.dice.text in monster &&
            typeof monster[item.dice.text] == "string" &&
            typeof monster[item.dice.default] == "number"
        ) {
            text = monster[item.dice.text] as string;
            def = monster[item.dice.default] as number;
            dice = true;
        }
    }
    const builder = (node: HTMLElement, desc: string) => {
        traitBuilder(node, desc, plugin, parse);
    };
</script>

<div class="line">
    <span class="property-name">{display}</span>
    {#if dice}
        <DiceRoll {text} defaultValue={def} />
    {:else if parse}
        <span class="property-text" use:builder={property} />
    {:else}
        <span class="property-text">{property}</span>
    {/if}
</div>

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
    .property-text {
        display: inline;
        margin: 0;
    }
</style>
