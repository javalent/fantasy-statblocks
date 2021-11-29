<script lang="ts">
    import type { Monster } from "@types";
    import { ExtraButtonComponent } from "obsidian";
    import {
        EXPORT_SYMBOL,
        HeadingItem,
        SAVE_SYMBOL
    } from "src/data/constants";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    export let monster: Monster;
    export let item: HeadingItem;
    export let canSave: boolean;
    export let canExport: boolean;

    const save = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon(SAVE_SYMBOL)
            .setTooltip("Save as Homebrew")
            .onClick(() => {
                dispatch("save");
            });
    };
    const png = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon(EXPORT_SYMBOL)
            .setTooltip("Export as PNG")
            .onClick(() => {
                dispatch("export");
            });
    };
</script>

<div class="flex-container">
    {#each item.properties as property}
        {#if property in monster}
            <div class="heading">{monster[property]}</div>
        {/if}
    {/each}
    {#if item.saveIcon || item.downloadIcon}
        <div class="icons">
            {#if item.saveIcon && canSave}
                <div class="save" use:save />
            {/if}
            {#if item.downloadIcon && canExport}
                <div class="png" use:png />
            {/if}
        </div>
    {/if}
</div>

<style>
    .flex-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .heading {
        font-family: "Libre Baskerville", "Lora", "Calisto MT",
            "Bookman Old Style", Bookman, "Goudy Old Style", Garamond,
            "Hoefler Text", "Bitstream Charter", Georgia, serif;
        color: var(--statblock-primary-color);
        font-weight: 700;
        margin: 0px;
        font-size: 23px;
        letter-spacing: 1px;
        font-variant: small-caps;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .icons {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
</style>
