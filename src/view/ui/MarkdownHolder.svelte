<script lang="ts">
    import { MarkdownRenderer } from "obsidian";

    import { getContext } from "svelte";
    import type StatBlockRenderer from "../statblock";

    export let property: string;

    const context = getContext<string>("context");
    const renderer = getContext<StatBlockRenderer>("renderer");

    const markdown = (node: HTMLElement) => {
        MarkdownRenderer.renderMarkdown(property, node, context, renderer);
    };
</script>

<div use:markdown />
