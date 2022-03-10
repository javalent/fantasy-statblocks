<script lang="ts">
    import type { Monster } from "@types";
    import { stringifyYaml } from "obsidian";
    import Traits from "./Traits.svelte";

    export let monster: Monster;
    let spells: string[] = monster.spells.map((s) => {
        if (typeof s == "string") return s;

        return stringifyYaml(s);
    });

    let header = `${monster.name} knows the following spells:`;
    if (typeof spells[0] == "string") {
        header = spells.shift() as string;
    }
    if (header[header.length - 1] != ":") header += ":";
</script>

<div class="spellcasting">
    <Traits name={"Spellcasting"} desc={header} />
    <ul class="spell-list">
        {#each spells as spellItem, index}

            {#if index == spells.length - 1 && !spellItem.includes(":")}
                <span class="spell-line">{spellItem}</span>
            {:else}
                <li class="spell-line">
                    <span class="spell-level">
                        {spellItem.split(":").shift()}:
                    </span>
                    <span class="spells">
                        {spellItem.split(":").pop()}
                    </span>
                </li>
            {/if}
        {/each}
    </ul>
</div>

<style>
    .spell-line .spells {
        font-style: italic;
    }
</style>
