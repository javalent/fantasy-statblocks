<script lang="ts">
    import { ExtraButtonComponent, TextComponent } from "obsidian";

    import type { Layout } from "src/data/constants";
    import Creator from "./ui/Creator.svelte";

    export let layout: Layout;

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
</script>

<div class="name" use:name />
<div class="creator-container">
    <div class="creator">
        <Creator blocks={layout.blocks} />
    </div>
    <div class="options" />
</div>

<style>
    .creator {
        max-width: 75vw;
        max-height: 75vh;
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
</style>
