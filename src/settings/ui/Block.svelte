<script lang="ts">
    import type { StatblockItem } from "src/data/constants";

    import Group from "./Blocks/GroupBlock.svelte";
    import PropertyBlock from "./Blocks/PropertyBlock.svelte";
    import type StatBlockPlugin from "src/main";
    import { ExtraButtonComponent, Menu } from "obsidian";
    import { createEventDispatcher } from "svelte";
    import { generate } from "../add";
    import { BlockModal } from "./block";
    import Rule from "src/view/ui/Rule.svelte";
    import copy from "fast-copy";

    export let block: StatblockItem;
    export let plugin: StatBlockPlugin;

    const dispatch = createEventDispatcher();

    const group = block.type == "group";
    const inline = block.type == "inline";

    const editBlock = () => {
        const modal = new BlockModal(plugin, block);

        modal.onClose = () => {
            if (!modal.saved) return;
            dispatch("edited", modal.block);
            /* block = copy(modal.block); */
        };
        modal.open();
    };

    const edit = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("pencil")
            .setTooltip("Edit Block")
            .onClick(() => {
                editBlock();
            });
    };

    const trash = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("trash")
            .setTooltip("Delete Block")
            .onClick(() => dispatch("trash", block));
    };

    const dropdown = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node).setIcon("vertical-three-dots");
        node.onclick = (evt) => {
            new Menu(plugin.app)
                .addItem((item) => {
                    item.setTitle("Add")
                        .setIcon("plus-with-circle")
                        .onClick(async () => {
                            if (
                                block.type == "group" ||
                                block.type == "inline"
                            ) {
                                const gen = await generate(plugin, evt);
                                if (gen) {
                                    block.nested = [...block.nested, gen];
                                    block = block;
                                }
                                dispatch("added");
                            }
                        });
                })
                .addItem((item) =>
                    item
                        .setTitle("Edit")
                        .setIcon("pencil")
                        .onClick(() => {
                            editBlock();
                        })
                )
                .addItem((item) =>
                    item
                        .setTitle("Delete")
                        .setIcon("trash")
                        .onClick(() => dispatch("trash", block))
                )
                .showAtMouseEvent(evt);
        };
    };
</script>

<div class="statblock-creator-container" class:group class:inline>
    {#key block}
        <div class="statblock-creator-block">
            {#if block.type == "group" || block.type == "inline"}
                <Group inline={block.type == "inline"} {block} {plugin} />
            {:else}
                <PropertyBlock {block} />
            {/if}
        </div>
    {/key}
    {#if group || inline}
        <div class="icons" use:dropdown />
    {:else}
        <div class="icons">
            <div class="icon" use:edit />
            <div class="icon" use:trash />
        </div>
    {/if}
</div>
{#if block.hasRule}
    <div aria-label="Block Has Rule">
        <Rule />
    </div>
{/if}

<style>
    .statblock-creator-container {
        display: flex;
        justify-content: space-between;
        /* align-items: center; */
        padding: 2px;
        margin: 2px;
        width: 100%;
        height: 100%;
    }

    :global(body:not(.is-mobile))
        .statblock-creator-container:not(:hover):not(.group):not(.inline)
        > .icons {
        visibility: hidden;
    }
    .statblock-creator-block {
        width: 100%;
    }
    .icons {
        display: flex;
        justify-content: flex-end;
    }
    .statblock-creator-container:not(.group):not(.inline) .icons {
        align-items: center;
    }
    .icon:not(:first-child) :global(.clickable-icon) {
        margin-left: 0;
    }
</style>
