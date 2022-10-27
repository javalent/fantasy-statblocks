<script lang="ts">
    import type { Monster } from "@types";
    import type { TextItem, TraitsItem } from "src/layouts/types";
    import { stringify } from "src/util/util";
    import TextContent from "./TextContent.svelte";

    export let monster: Monster;
    export let item: TraitsItem | TextItem;

    let header: string;

    if (item.headingProp) {
        if (item.heading in monster) {
            let monsterProp = stringify(monster[item.heading as keyof Monster]);
            if (monsterProp.length) header = monsterProp;
        }
    } else if (item.heading?.length) {
        header = item.heading;
    }
</script>

{#if header && header.length}
    <h3 class="section-header">
        <TextContent textToRender={header} />
    </h3>
{/if}

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
