<script lang="ts">
    import { setIcon } from "obsidian";

    import type {
        CollapseItem,
        IfElseItem,
        JavaScriptItem,
        StatblockItem
    } from "src/layouts/types";
    import type StatBlockPlugin from "src/main";

    export let block: Exclude<
        StatblockItem,
        IfElseItem | CollapseItem | JavaScriptItem
    >;
    export let plugin: StatBlockPlugin;

    if (block.type == "heading" && !block.size) {
        block.size = 1;
    }

    const transform = (text: string) => {
        if ("display" in block) {
            return `${block.display} (${
                text[0].toUpperCase() + text.slice(1).toLowerCase()
            })`;
        }
        return text[0].toUpperCase() + text.slice(1).toLowerCase();
    };

    const conditioned = (node: HTMLDivElement) => {
        setIcon(node, "statblock-conditioned");
    };
    const dice = (node: HTMLDivElement) => {
        setIcon(node, "dice-roller-dice");
    };
    const markdown = (node: HTMLDivElement) => {
        setIcon(node, "markdown-icon");
    };
    const heading = (node: HTMLDivElement) => {
        setIcon(node, "heading-glyph");
    };
    const code = (node: HTMLDivElement) => {
        setIcon(node, "code-glyph");
    };

    const getLayoutName = (id: string) => {
        return (
            plugin.layouts.find((layout) => id == layout.id)?.name ??
            "No layout selected"
        );
    };
</script>

<div class="property-block-container">
    <div class="info">
        <div>
            <span>{transform(block.type)}</span>
            {#if block.type == "heading"}
                <span>
                    (H{block.size})
                </span>
            {/if}
            {#if block.type == "table" && block.headers?.length}
                <strong>
                    ({block.headers.join(" | ")})
                </strong>
            {/if}
        </div>
        {#if block.type != "layout"}
            <small><em>{block.properties.join(", ")}</em></small>
        {:else}
            <small><em>{getLayoutName(block.layout)}</em></small>
        {/if}
    </div>
    <small class="context">
        {#if "heading" in block}
            <div
                class="context-item heading"
                use:heading
                aria-label="Has Heading"
            />
        {/if}
        {#if block.conditioned}
            <div
                class="context-item conditioned"
                use:conditioned
                aria-label="Conditioned"
            />
        {/if}
        {#if "callback" in block}
            <div
                class="context-item callback"
                use:code
                aria-label="Has Callback"
            />
        {/if}
        {#if "dice" in block && block.dice}
            <div
                class="context-item dice"
                use:dice
                aria-label="Will Parse for Dice Rolls"
            />
        {/if}
        {#if "markdown" in block && block.markdown}
            <div
                class="context-item dice"
                use:markdown
                aria-label="Render markdown enabled"
            />
        {/if}
    </small>
</div>

<style>
    .property-block-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .info {
        display: flex;
        flex-flow: column;
    }
    .context {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--text-muted);
    }
    .context-item {
        display: flex;
        align-items: center;
    }
</style>
