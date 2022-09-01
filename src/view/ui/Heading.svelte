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
                <TextContent
                    textToRender={stringify(monster[property])}
                />
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
        font-family: "Libre Baskerville", "Lora", "Calisto MT",
            "Bookman Old Style", Bookman, "Goudy Old Style", Garamond,
            "Hoefler Text", "Bitstream Charter", Georgia, serif;
        color: var(--statblock-primary-color);
        font-weight: 700;
        margin: 0px;
        font-size: 23px;
        letter-spacing: 1px;
        font-variant: small-caps;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
