<script lang="ts">
    import {
        addIcon,
        ButtonComponent,
        ExtraButtonComponent,
        Menu,
        Modal,
        TextComponent
    } from "obsidian";

    import type { Layout, StatblockItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import { createEventDispatcher } from "svelte";
import AddButton from "./ui/AddButton.svelte";
    import Creator from "./ui/Creator.svelte";

    export let layout: Layout;
    export let plugin: StatBlockPlugin;

    const dispatch = createEventDispatcher();

    const handleSorted = (e: CustomEvent<StatblockItem[]>) => {
        layout.blocks = [...e.detail];
    };

    addIcon(
        "dropzone-grip",
        `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="grip-vertical" class="svg-inline--fa fa-grip-vertical fa-w-10" role="img" viewBox="0 0 320 512"><path fill="currentColor" d="M96 32H32C14.33 32 0 46.33 0 64v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zM288 32h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32z"/></svg>`
    );

    let editingName = false;
    const name = (node: HTMLElement) => {
        node.empty();
        if (editingName) {
            let temp = layout.name;
            new TextComponent(node).setValue(temp).onChange((v) => {
                temp = v;
            });
            const buttons = node.createDiv("buttons");
            new ExtraButtonComponent(buttons)
                .setIcon("checkmark")
                .setTooltip("Save")
                .onClick(() => {
                    editingName = false;
                    layout.name = temp;
                    name(node);
                });
            new ExtraButtonComponent(buttons)
                .setIcon("cross-in-box")
                .setTooltip("Cancel")
                .onClick(() => {
                    editingName = false;
                    name(node);
                });
        } else {
            node.createEl("h3", { text: layout.name });
            new ExtraButtonComponent(node.createDiv("buttons"))
                .setIcon("pencil")
                .setTooltip("Edit Name")
                .onClick(() => {
                    editingName = true;
                    name(node);
                });
        }
    };

    const save = (node: HTMLDivElement) => {
        new ButtonComponent(node)
            .setIcon("checkmark")
            .setCta()
            .setTooltip("Save")
            .onClick(() => {
                dispatch("saved");
            });
    };
    const cancel = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("cross")
            .setTooltip("Cancel")
            .onClick(() => {
                dispatch("cancel");
            });
    };

    const edit = (evt: CustomEvent<StatblockItem>) => {
        console.log("🚀 ~ file: StatblockCreator.svelte ~ line 110 ~ evt", evt);
        const modal = new BlockModal(plugin, evt.detail);
        modal.open();
    };

    class BlockModal extends Modal {
        constructor(
            public plugin: StatBlockPlugin,
            public block?: StatblockItem
        ) {
            super(plugin.app);
        }
    }
</script>

<div class="top">
    <div class="name" use:name />
    <AddButton {plugin} />
</div>
<div class="creator-container">
    <Creator
        blocks={layout.blocks}
        {plugin}
        on:sorted={handleSorted}
        on:edit={edit}
    />
</div>
<div class="bottom">
    <div class="save" use:save />
    <div class="cancel" use:cancel />
</div>

<style>
    :global(body:not(.is-mobile)) .creator-container {
        max-width: 75vw;
        max-height: 75vh;
    }
    .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .name {
        display: flex;
        /* justify-content: space-between; */
        align-items: center;
    }
    .name :global(.buttons) {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .bottom {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
</style>
