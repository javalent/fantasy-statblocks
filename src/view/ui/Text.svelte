<script lang="ts">
    import type { Monster } from "@types";
    import type { TextItem } from "src/data/constants";
    import { stringify } from "../utils";
    import DiceHolder from "./DiceHolder.svelte";
    import SectionHeading from "./SectionHeading.svelte";

    export let monster: Monster;
    export let item: TextItem;

    let property =
        item.text && item.text.length
            ? item.text
            : stringify(monster[item.properties[0]]);

    if (!item.conditioned && !`${property}`.length) {
        property = item.fallback ?? "-";
    }
</script>

{#if !item.conditioned || (item.conditioned && `${property}`.length)}
    {#if item.heading}
        <SectionHeading header={item.heading} />
    {/if}
    <div class="line">
        <DiceHolder {property} />
    </div>
{/if}

<style></style>
