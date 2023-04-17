<script lang="ts">
    import TextContentHolder from "./TextContentHolder.svelte";

    type Spell = { level?: string; spells: string };
    export let spell: Spell;
    export let render = false;
</script>

<ul class="spell-item">
    {#if !spell.level}
        <span class="spell-line">
            <TextContentHolder {render} property={spell.spells} />
        </span>
    {:else}
        <li class="spell-line">
            <span class="spell-level">
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
    ul.spell-item {
        margin: 0;
    }
    ul.spell-item:first-of-type {
        margin-top: revert;
    }
    ul.spell-item:last-of-type {
        margin-bottom: revert;
    }
    .spells {
        font-style: italic;
    }
</style>
