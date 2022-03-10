<script lang="ts">
    import PropertyBlock from "./PropertyBlock.svelte";
    import type StatBlockPlugin from "src/main";
    import { ExtraButtonComponent } from "obsidian";
    import { createEventDispatcher } from "svelte";
    import { BlockModal } from "./block";
    import type { StatblockItem } from "src/layouts/types";

    export let block: StatblockItem;
    export let plugin: StatBlockPlugin;

    const dispatch = createEventDispatcher();

    const editBlock = () => {
        const modal = new BlockModal(plugin, block);

        modal.onClose = () => {
            if (!modal.saved) return;
            dispatch("edited", modal.block);
        };
        modal.open();
    };

    const edit = (node: HTMLDivElement) => {
        new ExtraButtonComponent(node)
            .setIcon("pencil")
            .setTooltip("Edit Block")
            .onClick(() => {
                editBlock();
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
    {#key block}
        <div class="statblock-creator-block">
            <PropertyBlock {block} />
        </div>
    {/key}
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
    .statblock-creator-container .icons {
        align-items: center;
    }
    .icon:not(:first-child) :global(.clickable-icon) {
        margin-left: 0;
    }
</style>
