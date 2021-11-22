<script lang="ts">
    import type { Monster } from "@types";
    import DiceRoll from "./DiceRoll.svelte";
    import Property from "./PropertyLine.svelte";

    export let monster: Monster;
</script>

<div class="top-stats">
    {#if monster.ac}
        <Property property={"Armor Class"} text={monster.ac} />
    {/if}
    {#if monster.hp}
        <Property property={"Hit Points"} text={monster.hp}>
            {#if monster.hit_dice}
                <DiceRoll text={monster.hit_dice} defaultValue={monster.hp} />
            {/if}
        </Property>
    {/if}
    {#if monster.speed}
        <Property property={"Speed"} text={monster.speed} />
    {/if}
</div>

<style>
</style>
