<script lang="ts">
    import { setNodeIcon } from "src/util";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function startDrag(e: Event) {
        // preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
        e.preventDefault();
        dispatch("disabled");
    }
</script>

<div class="block">
    <div
        class="icon"
        use:setNodeIcon={"dropzone-grip"}
        on:mousedown={startDrag}
        on:touchstart={startDrag}
    />
    <div class="item">
        <slot />
    </div>
</div>

<style>
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
