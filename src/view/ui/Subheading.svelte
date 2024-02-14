<script lang="ts">
    import type { Monster } from "index";
    import type { SubHeadingItem } from "types/layout";
    import { stringify } from "src/util/util";
    import TextContent from "./TextContent.svelte";

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
        <TextContent textToRender={subheading.join(item.separator)} />
    </div>
{/if}

<style>
    .subheading {
        font-weight: var(--active--subheading-font-weight);
        font-style: var(--active--subheading-font-style);
        font-size: var(--active--subheading-font-size);
        margin: 0;
    }
</style>
