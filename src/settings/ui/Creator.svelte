<script lang="ts">
    import type { StatblockItem } from "src/data/constants";

    import { flip } from "svelte/animate";
    import {
        dndzone,
        SHADOW_PLACEHOLDER_ITEM_ID,
        SOURCES,
        TRIGGERS
    } from "svelte-dnd-action";
    import Block from "./Block.svelte";
    import type StatBlockPlugin from "src/main";
    import { createEventDispatcher } from "svelte";
    import { ExtraButtonComponent, Menu, setIcon } from "obsidian";
    import { generate } from "../add";
    import { BlockModal } from "./block";
    import Rule from "src/view/ui/Rule.svelte";

    const dispatch = createEventDispatcher();

    export let blocks: StatblockItem[] = [];
    export let inline = false;
    export let plugin: StatBlockPlugin;

    /** Dropzone Functions */

    let flipDurationMs = 300;
    let dragDisabled = true;
    function handleConsider(e: CustomEvent<GenericDndEvent<StatblockItem>>) {
        const {
            items: newItems,
            info: { source, trigger }
        } = e.detail;
        blocks = [...newItems];
        // Ensure dragging is stopped on drag finish via keyboard
        if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
            dragDisabled = true;
        }
    }
    function handleFinalize(e: CustomEvent<GenericDndEvent<StatblockItem>>) {
        const {
            items: newItems,
            info: { source }
        } = e.detail;
        blocks = [...newItems];
        dispatch("sorted", blocks);
        // Ensure dragging is stopped on drag finish via pointer (mouse, touch)
        if (source === SOURCES.POINTER) {
            dragDisabled = true;
        }
    }
    const grip = (node: HTMLElement) => {
        setIcon(node, "dropzone-grip");
    };

    function startDrag(e: Event) {
        // preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
        e.preventDefault();
        dragDisabled = false;
    }

    const trash = (evt: StatblockItem) => {
        blocks = blocks.filter((b) => b.id != evt.id);
        dispatch("sorted", blocks);
    };

    const edited = (e: StatblockItem) => {
        const original = blocks.findIndex((v) => v.id == e.id);
        blocks.splice(original, 1, e);
        blocks = blocks;
    };
    const editBlock = (block: StatblockItem) => {
        const modal = new BlockModal(plugin, block);

        modal.onClose = () => {
            if (!modal.saved) return;
            edited(modal.block);
            /* block = copy(modal.block); */
        };
        modal.open();
    };

    const add = async (block: StatblockItem, evt: MouseEvent) => {
        if (!("nested" in block)) return;
        const gen = await generate(plugin, evt);
        if (gen) {
            block.nested = [...block.nested, gen];
            blocks = blocks;
            dispatch("sorted", blocks);
        }
    };

    const dropdown = (node: HTMLDivElement, block: StatblockItem) => {
        new ExtraButtonComponent(node).setIcon("vertical-three-dots");
        node.onclick = (evt) => {
            new Menu(plugin.app)
                .addItem((item) => {
                    item.setTitle("Add")
                        .setIcon("plus-with-circle")
                        .onClick((e: MouseEvent) => add(block, e));
                })
                .addItem((item) =>
                    item
                        .setTitle("Edit")
                        .setIcon("pencil")
                        .onClick(() => {
                            editBlock(block);
                        })
                )
                .addItem((item) =>
                    item
                        .setTitle("Delete")
                        .setIcon("trash")
                        .onClick(() => trash(block))
                )
                .showAtMouseEvent(evt);
        };
    };
</script>

<div class="creator">
    <section
        use:dndzone={{
            items: blocks,
            flipDurationMs,
            dragDisabled
        }}
        on:consider={handleConsider}
        on:finalize={handleFinalize}
        class:inline
        class="creator-zone"
    >
        {#each blocks.filter((x) => x.id !== SHADOW_PLACEHOLDER_ITEM_ID) as block (block.id)}
            <div animate:flip={{ duration: flipDurationMs }}>
                <div class="block-container">
                    <div class="block">
                        <div
                            class="icon"
                            use:grip
                            on:mousedown={startDrag}
                            on:touchstart={startDrag}
                            style={dragDisabled
                                ? "cursor: grab"
                                : "cursor: grabbing"}
                        />
                        {#if block.type != "group" && block.type != "inline"}
                            <div class="item">
                                <Block
                                    {plugin}
                                    {block}
                                    on:trash={(e) => trash(e.detail)}
                                    on:edited={(e) => edited(e.detail)}
                                />
                            </div>
                        {:else}
                            <div
                                class="item"
                                class:group={block.type == "group" ||
                                    block.type == "inline"}
                            >
                                <svelte:self
                                    bind:blocks={block.nested}
                                    bind:plugin
                                    inline={block.type == "inline"}
                                />
                            </div>
                            {#key block}
                                <div
                                    class="dropdown-icon"
                                    use:dropdown={block}
                                />
                            {/key}
                        {/if}
                    </div>
                    {#if block.hasRule}
                        <div aria-label="Block Has Rule">
                            <Rule />
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </section>
</div>

<style>
    :global(body:not(.is-mobile)) .creator-zone:not(.nested) {
        max-width: 75vw;
        max-height: 65vh;
        overflow: auto;
    }
    .inline {
        display: flex;
        justify-content: space-between;
    }
    .block {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    .item {
        display: flex;
        flex-flow: column;
        width: 100%;
        padding: 2px;
        margin: 2px;
    }
    .group {
        display: grid;
        grid-template-columns: 1fr;
        border: 2px dashed grey;
        min-height: 2rem;
    }
    .dropdown-icon {
        align-self: flex-start;
    }
    .inline {
        display: inline-flex;
    }
    .icon {
        display: flex;
    }
</style>
