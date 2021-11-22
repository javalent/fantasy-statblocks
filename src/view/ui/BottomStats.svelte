<script lang="ts">
    import type { Monster } from "@types";
    import { AbilityAliases } from "src/data/constants";
    import { toTitleCase } from "src/util/util";
    import PropertyLine from "./PropertyLine.svelte";

    export let monster: Monster;

    function getMod(value: number) {
        return `${value > 0 ? "+" : ""}${value}`;
    }

    const saves = monster.saves
        .map((ability) => {
            if (typeof ability != "object" || ability == null) return null;
            let key = Object.keys(ability)[0];
            if (!key) return null;
            if (!AbilityAliases[key.toLowerCase()]) return null;
            const value = Object.values(ability)[0];
            return `${AbilityAliases[key.toLowerCase()]} ${getMod(value)}`;
        })
        .filter((m) => m);
    const skillsaves = monster.skillsaves
        .map((ability) => {
            if (typeof ability != "object" || ability == null) return null;
            let key = Object.keys(ability)[0];
            if (!key) return null;
            const value = Object.values(ability)[0];
            return `${toTitleCase(key)} ${getMod(value)}`;
        })
        .filter((m) => m);
</script>

<div class="info">
    {#if saves && saves.length}
        <PropertyLine property={"Saving Throws"} text={saves.join(", ")} />
    {/if}
    {#if skillsaves && skillsaves.length}
        <PropertyLine property={"Skills"} text={skillsaves.join(", ")} />
    {/if}
    {#if monster.damage_immunities && monster.damage_immunities.length}
        <PropertyLine
            property={"Damage Immunities"}
            text={monster.damage_immunities}
        />
    {/if}
    {#if monster.condition_immunities && monster.condition_immunities.length}
        <PropertyLine
            property={"Condition Immunities"}
            text={monster.condition_immunities}
        />
    {/if}
    {#if monster.damage_resistances && monster.damage_resistances.length}
        <PropertyLine
            property={"Resistances"}
            text={monster.damage_resistances}
        />
    {/if}
    {#if monster.damage_vulnerabilities && monster.damage_vulnerabilities.length}
        <PropertyLine
            property={"Damage Vulnerabilities"}
            text={monster.damage_vulnerabilities}
        />
    {/if}
    {#if monster.senses && monster.senses.length}
        <PropertyLine property={"Senses"} text={monster.senses} />
    {/if}
    <PropertyLine property={"Languages"} text={monster.languages ?? "-"} />
</div>
