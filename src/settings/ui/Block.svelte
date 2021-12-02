<script lang="ts">
    import type { StatblockItem } from "src/data/constants";

    import Group from "./Blocks/GroupBlock.svelte";
    import Inline from "./Blocks/InlineBlock.svelte";
    import Heading from "./Blocks/HeadingBlock.svelte";
    import Subheading from "./Blocks/SubheadingBlock.svelte";
    import type StatBlockPlugin from "src/main";
    import { ExtraButtonComponent, Modal } from "obsidian";
    import { createEventDispatcher } from "svelte";

    export let block: StatblockItem;
    export let plugin: StatBlockPlugin;

    const dispatch = createEventDispatcher();

    export const blockBuilder = (node: HTMLElement) => {
        switch (block.type) {
            case "inline": {
                const group = new Inline({
                    target: node,
                    props: {
                        block,
                        plugin
                    },
                    context: new Map([["plugin", plugin]])
                });
                group.$on("edit", (e: CustomEvent<StatblockItem>) =>
                    dispatch("edit", e.detail)
                );
                group.$on("add", (e: CustomEvent) => dispatch("add", e.detail));
                break;
            }

            case "group": {
                const group = new Group({
                    target: node,
                    props: {
                        block,
                        plugin
                    },
                    context: new Map([["plugin", plugin]])
                });
                group.$on("edit", (e: CustomEvent<StatblockItem>) =>
                    dispatch("edit", e.detail)
                );
                group.$on("add", (e: CustomEvent) => dispatch("add", e.detail));
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
                dispatch("edit", block);
            });
    };
    const trash = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("trash")
            .setTooltip("Delete Block")
            .onClick(() => dispatch("trash", block));
    };
</script>

<div class="statblock-creator-container">
    <div class="statblock-creator-block" use:blockBuilder />
    <div class="icons">
        <div class="icon" use:edit />
        <div class="icon" use:trash />
    </div>
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
        .statblock-creator-container:not(:hover)
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
    .icon:not(:first-child) :global(.clickable-icon) {
        margin-left: 0;
    }
</style>
