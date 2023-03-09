<script lang="ts">
    import type { Monster } from "@types";
    import { stringifyYaml } from "obsidian";
    import { linkify, stringify } from "src/util/util";
    import SpellItem from "./SpellItem.svelte";
    import TextContentHolder from "./TextContentHolder.svelte";
    import Traits from "./Traits.svelte";

    export let render = false;
    export let monster: Monster;
    export let property: string;

    const ensureColon = (header: string) => {
        if (/[^a-zA-Z0-9]$/.test(header)) return header;
        return `${header}:`;
    };
    const linkifySpells = (spells: string): string => {
        if (!render) {
            return spells;
        }
        return spells.split(",").map(linkify).join(",");
    };
    type Spell = { level?: string; spells: string };
    type SpellBlock = { header: string; spells: Array<Spell> };
    let spellBlocks: Array<SpellBlock> = monster.spells.reduce(
        (acc, current) => {
            if (
                typeof current === "string" &&
                (current.charAt(current.length - 1) == ":" ||
                    !current.includes(":"))
            ) {
                const newBlock: SpellBlock = {
                    header: ensureColon(current),
                    spells: []
                };
                acc.push(newBlock);
                return acc;
            }
            const lastBlock: SpellBlock = acc[acc.length - 1];
            let spell: Spell;
            if (typeof current == "string") {
                spell = { spells: linkifySpells(current) };
            } else {
                try {
                    spell = {
                        level: Object.keys(current).shift(),
                        spells: linkifySpells(stringify(Object.values(current).shift()))
                    };
                } catch (e) {
                    return acc;
                }
            }
            if (lastBlock) {
                lastBlock.spells.push(spell);
            } else {
                const missingHeaderBlock: SpellBlock = {
                    header: `${monster.name} knows the following spells:`,
                    spells: [spell]
                };
                acc.push(missingHeaderBlock);
            }
            return acc;
        },
        []
    );
</script>

<div class="spellcasting">
    {#each spellBlocks as block, blockIndex}
        {#if blockIndex === 0}
            <Traits name={"Spellcasting"} desc={block.header} {property} />
        {:else}
            <Traits name={""} desc={block.header} {property} />
        {/if}
        {#each block.spells as spell, index}
            <SpellItem {spell} {render} />
        {/each}
    {/each}
</div>

<style>
    .spell-line .spells {
        font-style: var(--statblock-spells-font-style);
    }
</style>
