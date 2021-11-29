<script lang="ts">
    import { dndzone, SOURCES, TRIGGERS } from "svelte-dnd-action";
    import type { StatblockItem } from "src/data/constants";

    export let blocks: StatblockItem[] = [];
    export const flipDurationMs = 300;
    $: items = [...blocks];

    export let dragDisabled = false;

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

<section
    use:dndzone={{ items, flipDurationMs }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
>
    <slot />
</section>

<style>
    
</style>
