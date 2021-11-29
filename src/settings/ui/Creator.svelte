<script lang="ts">
    import type { StatblockItem } from "src/data/constants";

    import { addIcon } from "obsidian";

    import Dropitem from "./Dropitem.svelte";

    import { flip } from "svelte/animate";
    import { dndzone, SOURCES, TRIGGERS } from "svelte-dnd-action";
    import { blockBuilder } from "./block";

    addIcon(
        "dropzone-grip",
        `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="grip-lines" class="svg-inline--fa fa-grip-lines fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M496 288H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-128H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16z"/></svg>`
    );

    export let blocks: StatblockItem[] = [];
    export let inline = false;

    /** Dropzone Functions */
    $: items = [...blocks];

    let flipDurationMs = 300;
    let dragDisabled = false;
    function handleConsider(e: CustomEvent<GenericDndEvent<StatblockItem>>) {
        const {
            items: newItems,
            info: { source, trigger }
        } = e.detail;
        items = newItems;
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
        items = newItems;
        // Ensure dragging is stopped on drag finish via pointer (mouse, touch)
        if (source === SOURCES.POINTER) {
            dragDisabled = true;
        }
    }
</script>

<div class="creator">
    <section
        use:dndzone={{ items, flipDurationMs }}
        on:consider={handleConsider}
        on:finalize={handleFinalize}
        class:inline
    >
        {#each items as block (block.id)}
            <div animate:flip={{ duration: flipDurationMs }}>
                <Dropitem on:disabled={() => (dragDisabled = !dragDisabled)}>
                    <div use:blockBuilder={block} />
                </Dropitem>
            </div>
        {/each}
    </section>
</div>

<style>
    .inline {
        display: flex;
        justify-content: space-between;
        border: 2px dashed grey;
    }
</style>
