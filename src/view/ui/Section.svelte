<script lang="ts">
    import type { Trait } from "@types";
    import type StatBlockPlugin from "src/main";
    import { getContext } from "svelte";

    export let header: string = null;
    export let blocks: Trait[];

    const plugin = getContext<StatBlockPlugin>("plugin");

    const traitBuilder = (node: HTMLElement, desc: string) => {
        const holder = createDiv();
        holder.setText(desc);

        //regex \s(?=(?=[\+\-]\d+ to hit)|(?=\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+\))))

        console.log(
            desc.split(
                /\s(?=(?=[\+\-]\d+ to hit)|(?=\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+\))))/
            )
        );
        node.appendChild(holder);
    };
</script>

<div class="section">
    {#if header}
        <h3 class="section-header">
            {header}
        </h3>
    {/if}
    {#each blocks as block}
        <div class="property">
            <div class="property-name">{block.name}</div>
            <div class="property-text" use:traitBuilder={block.desc} />
        </div>
    {/each}
</div>

<style>
    .section-header {
        border-bottom: 1px solid var(--statblock-primary-color);
        color: var(--statblock-primary-color);
        font-size: 21px;
        font-variant: small-caps;
        font-weight: normal;
        letter-spacing: 1px;
        margin: 0;
        margin-bottom: 0.3em;
        break-inside: avoid-column;
        break-after: avoid-column;
    }
</style>
