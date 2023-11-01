<script lang="ts">
    import type { Monster } from "index";
    import type { TextItem, TraitsItem, GroupItem, InlineItem } from "types/layout";
    import { stringify } from "src/util/util";
    import TextContent from "./TextContent.svelte";

    export let monster: Monster;
    export let item: TraitsItem | TextItem | GroupItem | InlineItem;

    let header: string;

    if (item.headingProp) {
        if (item.heading in monster) {
            let monsterProp = stringify(monster[item.heading as keyof Monster]);
            if (monsterProp.length) header = monsterProp;
        }
    } else if (item.heading?.length) {
        header = item.heading;
    }
const slugify = (header: string) =>
        header
            .toLowerCase()
            .replace(/[^A-Za-z0-9\s]/g, "")
            .replace(/\s+/g, "-")
</script>

{#if header && header.length}
    <h3 class="section-header {slugify(header)}">
        <TextContent textToRender={header} />
    </h3>
{/if}

<style>
    .section-header {
        border-bottom: var(--statblock-section-heading-border-size) solid
            var(--statblock-section-heading-border-color);
        color: var(--statblock-section-heading-font-color);
        font-size: var(--statblock-section-heading-font-size);
        font-variant: var(--statblock-section-heading-font-variant);
        font-weight: var(--statblock-section-heading-font-weight);
        letter-spacing: 1px;
        margin: 0;
        margin-bottom: 0.3em;
        break-inside: avoid-column;
        break-after: avoid-column;
    }
</style>
