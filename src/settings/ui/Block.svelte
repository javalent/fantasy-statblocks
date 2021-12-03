<script lang="ts">
    import type { PropertyItem, StatblockItem } from "src/data/constants";

    import Group from "./Blocks/GroupBlock.svelte";
    import Heading from "./Blocks/HeadingBlock.svelte";
    import Subheading from "./Blocks/SubheadingBlock.svelte";
    import type StatBlockPlugin from "src/main";
    import { ExtraButtonComponent, Menu, Modal, Setting } from "obsidian";
    import { createEventDispatcher } from "svelte";
    import { generate } from "../add";
    import { BlockModal } from "./block";
    export let block: StatblockItem;
    console.log("🚀 ~ file: Block.svelte ~ line 13 ~ block", block);
    export let plugin: StatBlockPlugin;

    const dispatch = createEventDispatcher();

    const group = block.type == "group";
    const inline = block.type == "inline";

    export const blockBuilder = (node: HTMLElement) => {
        switch (block.type) {
            case "inline":
            case "group": {
                const group = new Group({
                    target: node,
                    props: {
                        block,
                        plugin,
                        inline: block.type == "inline"
                    },
                    context: new Map([["plugin", plugin]])
                });
                group.$on("edit", (e: CustomEvent<StatblockItem>) =>
                    dispatch("edit", e.detail)
                );

                break;
            }
            case "heading": {
                new Heading({
                    target: node,
                    props: {
                        block,
                        plugin
                    },
                    context: new Map([["plugin", plugin]])
                });
                break;
            }

            case "subheading": {
                new Subheading({
                    target: node,
                    props: {
                        block,
                        plugin
                    },
                    context: new Map([["plugin", plugin]])
                });
                break;
            }
            default: {
                node.setText(block.type);
            }
        }
    };

    const edit = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("pencil")
            .setTooltip("Edit Block")
            .onClick(() => {
                console.log("click");
                const modal = new BlockModal(plugin, block);
                modal.open();
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
                            }
                        });
                })
                .addItem((item) =>
                    item
                        .setTitle("Edit")
                        .setIcon("pencil")
                        .onClick(() => {
                            const modal = new BlockModal(plugin, block);
                            modal.open();
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
        <div class="statblock-creator-block" use:blockBuilder />
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
