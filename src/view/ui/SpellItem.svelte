<script lang="ts">
    import TextContentHolder from "./TextContentHolder.svelte";

    type Spell = { level?: string; spells: string };
    export let spell: Spell;
    export let render = false;
</script>

<ul class="statblock-spell-block">
    {#if !spell.level}
        <span class="spell-input">
            <TextContentHolder {render} property={spell.spells} />
        </span>
    {:else}
        <li class="spell-input">
            <span class="fs-spell-level">
                <TextContentHolder {render} property={`${spell.level}:`} />
                <!-- {spellItem.split(":").shift()}: -->
            </span>
            <span class="spells">
                <TextContentHolder {render} property={spell.spells} />
                <!-- {spellItem.split(":").pop()} -->
            </span>
        </li>
    {/if}
</ul>

<style scoped>
    ul.statblock-spell-block {
        margin: 0;
    }
    ul.statblock-spell-block:first-of-type {
        margin-top: revert;
    }
    ul.statblock-spell-block:last-of-type {
        margin-bottom: revert;
    }
    .spells {
        font-style: italic;
    }
</style>
