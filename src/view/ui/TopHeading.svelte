<script lang="ts">
    import type { Monster } from "@types";
    import { ExtraButtonComponent } from "obsidian";
    import { EXPORT_SYMBOL, SAVE_SYMBOL } from "src/data/constants";
    import { createEventDispatcher } from "svelte";
    import Rule from "./Rule.svelte";
    const dispatch = createEventDispatcher();
    export let monster: Monster;

    const save = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon(SAVE_SYMBOL)
            .setTooltip("Save as Homebrew")
            .onClick(() => {
                dispatch("save", { ...monster, source: "Homebrew" });
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

    const subheading: string[] = [];
    const size = monster.size;
    const type = monster.type;
    const subtype = monster.subtype;
    const alignment = monster.alignment;
    if (size)
        subheading.push(
            `${size[0].toUpperCase() + size.slice(1).toLowerCase()}`
        );
    if (type) {
        subheading.push(type);
        if (subtype) subheading.push(`(${subtype})`);
    }
    if (alignment) subheading.push(alignment);
</script>

<div class="heading">
    {#if monster.name}
        <div class="flex-container">
            <div class="name">{monster.name}</div>
            <div class="icons">
                <div class="save" use:save />
                <div class="png" use:png />
            </div>
        </div>
    {/if}
    {#if subheading.length}
        <div class="subheading">
            {subheading.join(" ")}
        </div>
    {/if}
</div>

<style>
    .flex-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .name {
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
    .subheading {
        font-weight: normal;
        font-style: italic;
        font-size: 12px;
        margin: 0;
    }
</style>
