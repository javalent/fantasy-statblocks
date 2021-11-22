<script lang="ts">
    import type { Monster } from "@types";

    export let monster: Monster;

    function getMod(stat: number) {
        let mod = Math.floor(((stat ?? 10) - 10) / 2);
        return `${mod >= 0 ? "+" : "-"}${Math.abs(mod)}`;
    }
</script>

<div class="abilities" class:fage={"fage_stats" in monster}>
    {#if "fage_stats" in monster}
        <div class="top">
            {#each ["Accuracy", "Communication", "Constitution", "Dexterity", "Fighting"] as stat, index}
                <div class="ability-score">
                    <strong>{stat}</strong>
                    <span>{monster.fage_stats[index]}</span>
                </div>
            {/each}
        </div>
        <div class="bottom">
            {#each ["Intelligence", "Perception", "Strength", "Willpower"] as stat, index}
                <div class="ability-score">
                    <strong>{stat}</strong>
                    <span>{monster.fage_stats[index]}</span>
                </div>
            {/each}
        </div>
    {:else}
        {#each ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as stat, index}
            <div class="ability-score">
                <strong>{stat}</strong>
                <span>
                    {monster.stats[index]} ({getMod(monster.stats[index])})
                </span>
            </div>
        {/each}
    {/if}
</div>

<style>
    .abilities {
        display: grid;
        grid-template-columns: repeat(6, 1fr);

        color: var(--statblock-primary-color);
    }
    .fage .top {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.5rem;
    }
    .fage .bottom {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
    }
    .ability-score {
        display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    }
</style>
