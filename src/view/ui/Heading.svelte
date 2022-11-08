<script lang="ts">
    import type { Monster } from "@types";
    import type { HeadingItem } from "src/layouts/types";
    import { stringify } from "src/util/util";
    import TextContent from "./TextContent.svelte";

    export let monster: Monster;
    export let item: HeadingItem;
</script>

<div class="flex-container">
    {#each item.properties as property}
        {#if property in monster}
            <div class="heading">
                <TextContent textToRender={stringify(monster[property])} />
            </div>
        {/if}
    {/each}
</div>

<style>
    .flex-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .heading {
        font-family: var(--statblock-heading-font);
        color: var(--statblock-primary-color);
        font-weight: var(--statblock-heading-font-weight);
        margin: 0px;
        font-size: var(--statblock-heading-font-size);
        letter-spacing: 1px;
        font-variant: var(--statblock-heading-font-variant);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
