<script lang="ts">
    import type { StatblockItem } from "src/data/constants";

    import { flip } from "svelte/animate";
    import { dndzone, SOURCES, TRIGGERS } from "svelte-dnd-action";
    import Block from "./Block.svelte";
    import type StatBlockPlugin from "src/main";
    import { createEventDispatcher } from "svelte";
    import { setIcon } from "obsidian";

    const dispatch = createEventDispatcher();

    export let blocks: StatblockItem[] = [];
    export let inline = false;
    export let plugin: StatBlockPlugin;

    let dropFromOthersDisabled = false;

    /** Dropzone Functions */

    let flipDurationMs = 300;
    let dragDisabled = true;
    function handleConsider(e: CustomEvent<GenericDndEvent<StatblockItem>>) {
        const {
            items: newItems,
            info: { source, trigger }
        } = e.detail;
        blocks = newItems;
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
        blocks = newItems;
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

    const trash = (evt: CustomEvent<StatblockItem>) => {
        blocks = blocks.filter((b) => b.id != evt.detail.id);
        dispatch("sorted", blocks);
    };

    const add = async (e: MouseEvent) => {
        console.log("🚀 ~ file: Creator.svelte ~ line 63 ~ e", e);
        dispatch("add", e);
    };
</script>

<div class="creator">
    <section
        use:dndzone={{
            items: blocks,
            flipDurationMs,
            dropFromOthersDisabled,
            dragDisabled
        }}
        on:consider={handleConsider}
        on:finalize={handleFinalize}
        class:inline
    >
        {#each blocks as block (block.id)}
            <div animate:flip={{ duration: flipDurationMs }}>
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
                    <div class="item">
                        <Block
                            {plugin}
                            {block}
                            on:add={(e) => {
                                add(e.detail);
                            }}
                            on:trash={trash}
                        />
                    </div>
                </div>
            </div>
        {/each}
    </section>
</div>

<style>
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
        width: 100%;
    }
    .icon {
        display: flex;
    }
</style>
