<script lang="ts">
    import type { Monster } from "@types";
    import BottomStats from "./BottomStats.svelte";
    import Rule from "./Rule.svelte";
    import Stats from "./Stats.svelte";
    import TopHeading from "./TopHeading.svelte";
    import TopStats from "./TopStats.svelte";
    import Traits from "./Traits.svelte";
    import Section from "./Section.svelte";

    export let monster: Monster;

    function inMonster<T extends keyof Monster>(...keys: T[]) {
        return keys.some((s) => {
            if (!(s in monster)) return false;
            if (monster[s] == undefined) return false;
            if (typeof monster[s] !== "number") {
                return (monster[s] as any).length;
            }
            return true;
        });
    }
</script>

<div class="statblock-content">
    {#if inMonster("name", "type", "alignment")}
        <TopHeading {monster} />
        <Rule />
    {/if}
    {#if inMonster("ac", "hp", "speed")}
        <TopStats {monster} />
        <Rule />
    {/if}
    {#if inMonster("fage_stats", "stats")}
        <Stats {monster} />
        <Rule />
    {/if}
    {#if inMonster("saves", "skillsaves", "damage_immunities", "condition_immunities", "damage_vulnerabilities", "senses", "languages", "cr")}
        <BottomStats {monster} />
        <Rule />
    {/if}
    {#if inMonster("spells", "traits")}
        <Traits {monster} />
    {/if}
    {#if inMonster("actions")}
        <Section blocks={monster.actions} header={"Actions"} />
    {/if}
    {#if inMonster("legendary_actions")}
        <Section
            blocks={monster.legendary_actions}
            header={"Legendary Actions"}
        />
    {/if}
    {#if inMonster("reactions")}
        <Section blocks={monster.reactions} header={"Reactions"} />
    {/if}
</div>

<style>
    .statblock-content {
        font-family: "Noto Sans", "Myriad Pro", Calibri, Helvetica, Arial,
            sans-serif;
        font-size: 14px;
        color: var(--statblock-primary-color);
        background-color: var(--statblock-background-color);
        padding: 0.5em;
        border: 1px #ddd solid;
        box-shadow: 0 0 1.5em #ddd;
        margin-left: 2px;
        margin-right: 2px;
        max-width: 400px;
    }
</style>
