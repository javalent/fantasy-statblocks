<script lang="ts">
    import type { Monster } from "@types";
    import { Notice } from "obsidian";
    import type { StatblockItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";

    import { getContext } from "svelte";

    import DiceRoll from "./DiceRoll.svelte";
    export let property: string;

    let item = getContext<StatblockItem>("item");

    let dice = getContext<boolean>("dice") && item.dice;
    let monster = getContext<Monster>("monster");
    let plugin = getContext<StatBlockPlugin>("plugin");

    let split: Array<{ text: string; original?: string } | string> = [property];
    if (dice) {
        if (
            item.diceProperty &&
            item.diceProperty in monster &&
            typeof monster[item.diceProperty] == "string"
        ) {
            split = [{ text: monster[item.diceProperty] as string }];
        } else if (item.diceCallback) {
            const func = new Function(
                "monster",
                "plugin",
                "property",
                item.diceCallback
            );
            try {
                const parsed = func.call(undefined, monster, plugin, property);
                if (Array.isArray(parsed)) {
                    split = parsed;
                } else {
                    split = [parsed];
                }
            } catch (e) {
                new Notice(
                    `There was an error executing the provided dice callback for [${item.properties.join(
                        ", "
                    )}]\n\n${e.message}`
                );
                console.error(e);
            }
        }
    }
</script>

{#if !dice}
    <span class="property-text">{property}</span>
{:else}
    {#each split as test}
        {#if typeof test != "string" && typeof test == "object" && "text" in test}
            <DiceRoll
                text={test?.text ?? property}
                original={test?.original ?? test?.text ?? property}
            />
        {:else}
            <span class="property-text">{test}</span>
        {/if}
    {/each}
{/if}

<style>
    .property-text {
        display: inline;
        margin: 0;
    }
</style>
