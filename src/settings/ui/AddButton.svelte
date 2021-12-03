<script lang="ts">
    import { ExtraButtonComponent, Menu } from "obsidian";
    import type StatBlockPlugin from "src/main";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let plugin: StatBlockPlugin;

    const add = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("plus-with-circle")
            .setTooltip("Add Block");
    };
</script>

<div class="add" use:add on:click={(evt) => dispatch("add", evt)} />

<style>
    .add {
        margin-top: 4px;
    }
</style>
