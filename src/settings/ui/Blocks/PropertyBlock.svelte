<script lang="ts">
    import { setIcon } from "obsidian";

    import type { StatblockItem } from "src/data/constants";

    export let block: StatblockItem;

    const transform = (text: string) => {
        if ("display" in block) {
            return `${block.display} (${
                text[0].toUpperCase() + text.slice(1).toLowerCase()
            })`;
        }
        return text[0].toUpperCase() + text.slice(1).toLowerCase();
    };

    const conditioned = (node: HTMLDivElement) => {
        setIcon(node, "question-mark-glyph");
    };
    const dice = (node: HTMLDivElement) => {
        setIcon(node, "dice-roller-dice");
    };
    const heading = (node: HTMLDivElement) => {
        setIcon(node, "heading-glyph");
    };
    const code = (node: HTMLDivElement) => {
        setIcon(node, "code-glyph");
    };
</script>

<div class="property-block-container">
    <div class="info">
        <span>{transform(block.type)}</span>
        <small><em>{block.properties.join(", ")}</em></small>
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
        {#if "dice" in block}
            <div
                class="context-item dice"
                use:dice
                aria-label="Will Parse for Dice Rolls"
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
        gap: 0.1rem;
        color: var(--text-muted);
    }
</style>
