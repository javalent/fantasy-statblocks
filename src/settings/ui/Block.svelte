<script lang="ts">
    import type { StatblockItem } from "src/data/constants";

    import Group from "./Blocks/GroupBlock.svelte";
    import Inline from "./Blocks/InlineBlock.svelte";
    import Heading from "./Blocks/HeadingBlock.svelte";
    import Subheading from "./Blocks/SubheadingBlock.svelte";
    import type StatBlockPlugin from "src/main";
    import { ExtraButtonComponent } from "obsidian";

    export let block: StatblockItem;
    export let plugin: StatBlockPlugin;

    export const blockBuilder = (node: HTMLElement) => {
        switch (block.type) {
            case "inline": {
                new Inline({
                    target: node,
                    props: {
                        block,
                        plugin
                    },
                    context: new Map([["plugin", plugin]])
                });
                break;
            }

            case "group": {
                new Group({
                    target: node,
                    props: {
                        block,
                        plugin
                    },
                    context: new Map([["plugin", plugin]])
                });
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
        new ExtraButtonComponent(node).setIcon("pencil");
    };
    let hovered = false;
    $: hovered = hovered;
</script>

<div
    class="statblock-creator-container"
    class:hovered
    on:mouseenter={(e) => {
        e.stopPropagation();
        hovered = true;
        console.log("🚀 ~ file: Block.svelte ~ line 81 ~ hovered", hovered);
    }}
    on:mouseleave={(e) => {
        e.stopPropagation();
        hovered = false;
    }}
>
    <div class="statblock-creator-block" use:blockBuilder />
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
    .statblock-creator-block {
        width: 100%;
    }
    .edit {
        display: flex;
    }
</style>
