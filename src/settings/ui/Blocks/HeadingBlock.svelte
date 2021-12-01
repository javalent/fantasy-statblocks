<script lang="ts">
    import type { HeadingItem } from "src/data/constants";

    import type StatBlockPlugin from "src/main";

    export let block: HeadingItem;
    export let plugin: StatBlockPlugin;
</script>

<div class="heading">Heading</div>

<style>
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
