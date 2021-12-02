<script lang="ts">
    import { ExtraButtonComponent, Menu } from "obsidian";
    import type StatBlockPlugin from "src/main";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let plugin: StatBlockPlugin;

    const add = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("plus-with-circle")
            .setTooltip("Add Block");
    };

    const types = [
        "Traits",
        "Heading",
        "Subheading",
        "Property",
        "Table",
        "Saves",
        "Spells",
        "Inline",
        "Group"
    ];

    const addMenu = new Menu(plugin.app).setNoIcon();
    types.forEach((type) => {
        addMenu.addItem((item) => {
            item.setTitle(type).onClick(() => dispatch("add", type));
        });
    });
</script>

<div class="add" use:add on:click={(evt) => addMenu.showAtMouseEvent(evt)} />

<style>
    .add {
        margin-top: 4px;
    }
</style>
