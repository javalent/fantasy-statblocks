<script lang="ts">
    import {
        ButtonComponent,
        ExtraButtonComponent,
        Menu,
        TextComponent
    } from "obsidian";
    import { Layout, StatblockItem, TypeNames } from "types/layout";

    import type StatBlockPlugin from "src/main";
    import { createEventDispatcher } from "svelte";

    import { blockGenerator, generate } from "./add";
    import Creator from "./ui/Creator.svelte";

    export let layout: Layout;
    export let plugin: StatBlockPlugin;

    $: items = layout.blocks;
    const getIds = (items: StatblockItem[]): string[] => {
        return [
            ...items
                .map((item) => {
                    if ("nested" in item) {
                        return [item.id, getIds(item.nested)].flat();
                    }
                    return [item.id];
                })
                .flat()
        ];
    };

    const dispatch = createEventDispatcher();

    const handleSorted = (e: CustomEvent<StatblockItem[]>) => {
        layout.blocks = [...e.detail];
    };

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

    const add = async (e: MouseEvent) => {
        const addMenu = new Menu().setNoIcon();
        TypeNames.forEach((type) => {
            if (type[1] == "separator") {
                addMenu.addSeparator();
                return;
            }
            addMenu.addItem((item) => {
                item.setTitle(type[1]).onClick(() => {
                    const block = blockGenerator(type[0]);
                    if (block) layout.blocks = [...layout.blocks, block];
                });
            });
        });
        addMenu.showAtMouseEvent(e);
    };
    const addButton = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("plus-with-circle")
            .setTooltip("Add Block");
    };
</script>

<div class="top">
    <div class="name" use:name />
    <div class="add" use:addButton on:click={(evt) => add(evt)} />
</div>
<div class="creator-container">
    {#key layout}
        <Creator
            blocks={items}
            {plugin}
            on:sorted={handleSorted}
            layout={layout.id}
        />
    {/key}
</div>
<div class="bottom">
    <div class="save" use:save />
    <div class="cancel" use:cancel />
</div>

<style>
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
        margin-top: 0.5rem;
    }
</style>
