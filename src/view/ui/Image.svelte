<script lang="ts">
    import type { Monster } from "@types";
    import type { ImageItem } from "src/data/constants";

    export let monster: Monster;
    export let item: ImageItem;
</script>

<div class="flex-container">
    {#each item.properties as property}
        {#if property in monster}
            <div class="image">{monster[property]}</div>
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
