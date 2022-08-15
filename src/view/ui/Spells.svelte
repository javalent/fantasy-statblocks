<script lang="ts">
    import type { Monster } from "@types";
    import { stringifyYaml } from "obsidian";
import TextContentHolder from "./TextContentHolder.svelte";
    import Traits from "./Traits.svelte";

    export let render = false;
    export let monster: Monster;
    const ensureColon = (header: string) => {
        if (/[^a-zA-Z0-9]$/.test(header)) return header;
        return `${header}:`;
    };
    type SpellBlock = { header: string; spells: Array<string> };
    let spellBlocks: Array<SpellBlock> = monster.spells.reduce(
        (acc, current) => {
            if (
                typeof current === "string" &&
                (current.charAt(current.length - 1) == ":" ||
                    !(current.includes(":")))
            ) {
                const newBlock: SpellBlock = {
                    header: ensureColon(current),
                    spells: []
                };
                acc.push(newBlock);
                return acc;
            }
            const lastBlock: SpellBlock = acc[acc.length - 1];
            const spell =
                typeof current == "string" ? current : stringifyYaml(current);
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
            <Traits name={"Spellcasting"} desc={block.header} />
        {:else}
            <Traits name={""} desc={block.header} />
        {/if}
        <ul class="spell-list">
            {#each block.spells as spellItem, index}
                {#if !spellItem.includes(":")}
                    <span class="spell-line">{spellItem}</span>
                {:else}
                    <li class="spell-line">
                        <span class="spell-level">
                            <TextContentHolder {render} property={`${spellItem.split(":").shift()}:`} />
                            <!-- {spellItem.split(":").shift()}: -->
                        </span>
                        <span class="spells">
                            <TextContentHolder {render} property={spellItem.split(":").pop()} />
                            <!-- {spellItem.split(":").pop()} -->
                        </span>
                    </li>
                {/if}
            {/each}
        </ul>
    {/each}
</div>

<style>
    .spell-line .spells {
        font-style: italic;
    }
</style>
