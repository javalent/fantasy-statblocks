<script lang="ts">
    import type { Monster } from "@types";
    import type { SubHeadingItem } from "src/data/constants";
    import { stringify } from "src/util/util";

    export let monster: Monster;
    export let item: SubHeadingItem;
    const subheading: string[] = [];

    for (let property of item.properties) {
        if (property in monster) {
            subheading.push(`${stringify(monster[property])}`);
        }
    }
</script>

{#if subheading.length}
    <div class="subheading">
        {subheading.join(item.separator ?? " ")}
    </div>
{/if}

<style>
    .subheading {
        font-weight: normal;
        font-style: italic;
        font-size: 12px;
        margin: 0;
    }
</style>
