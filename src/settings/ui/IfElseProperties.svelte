<script lang="ts">
    import { ExtraButtonComponent, setIcon } from "obsidian";
    import type { IfElseCondition } from "src/layouts/types";
    import { createEventDispatcher } from "svelte";
    import { dndzone, SOURCES, TRIGGERS } from "svelte-dnd-action";
    import IfElseProperty from "./IfElseProperty.svelte";

    type PropItem = { prop: IfElseCondition; id: string };
    export let conditions: PropItem[] = [];
    export let editing: string = null;

    const dispatch = createEventDispatcher();

    let flipDurationMs = 300;
    let dragDisabled = true;
    function handleConsider(e: CustomEvent<GenericDndEvent<PropItem>>) {
        const {
            items: newItems,
            info: { source, trigger }
        } = e.detail;
        items = [...newItems];
        // Ensure dragging is stopped on drag finish via keyboard
        if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
            dragDisabled = true;
        }
    }
    function handleFinalize(e: CustomEvent<GenericDndEvent<PropItem>>) {
        const {
            items: newItems,
            info: { source }
        } = e.detail;
        items = [...newItems];
        dispatch(
            "sorted",
            items.map(({ prop }) => prop)
        );
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

    const trash = (evt: PropItem) => {
        items = items.filter((b) => b.id != evt.id);
        dispatch(
            "sorted",
            items.map(({ prop }) => prop)
        );
    };
    const finishEditing = (evt: PropItem) => {
        items = items.map((i) =>
            i.id == evt.id ? { id: evt.id, prop: evt.prop } : i
        );
        editing = null;
        dispatch(
            "sorted",
            items.map(({ prop }) => prop)
        );
    };

    $: items = [...conditions];
</script>

<section
    use:dndzone={{
        items,
        flipDurationMs,
        dragDisabled,
        type: "subheading"
    }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
    class="subheading-zone"
>
    {#each items as property (property.id)}
        {#key editing}
            <div class="setting-item">
                <div
                    class="icon"
                    use:grip
                    on:mousedown={startDrag}
                    on:touchstart={startDrag}
                    style={dragDisabled ? "cursor: grab" : "cursor: grabbing"}
                />
                <IfElseProperty
                    condition={property.prop}
                    editing={editing == property.id}
                    on:delete={() => trash(property)}
                    on:edit={() => (editing = property.id)}
                    on:done={() => finishEditing(property)}
                />
            </div>
        {/key}
    {/each}
</section>

<style scoped>
    .setting-item {
        align-items: center;
    }
    .icon {
        display: flex;
        align-items: center;
    }
</style>
