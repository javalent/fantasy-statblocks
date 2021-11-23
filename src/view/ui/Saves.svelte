<script lang="ts">
    import type { Monster } from "@types";
    import type { StatblockItem } from "src/data/constants";
    import { toTitleCase } from "src/util/util";
    import GenericProperty from "./GenericProperty.svelte";

    export let monster: Monster;
    export let item: StatblockItem;

    function getMod(value: number) {
        return `${value > 0 ? "+" : ""}${value}`;
    }

    let arr: any[] = monster[item.properties[0]] as any[];
    if (!Array.isArray(arr)) {
        arr = [];
    }

    const saves = arr
        .map((ability) => {
            if (typeof ability != "object" || ability == null) return null;
            let key = Object.keys(ability)[0];
            if (!key) return null;
            const value = Object.values(ability)[0];
            if (!value || isNaN(Number(value))) return null;
            return `${toTitleCase(key)} ${getMod(value as number)}`;
        })
        .filter((m) => m);
</script>

<div class="info">
    {#if saves && saves.length}
        <GenericProperty
            property={item.display ?? toTitleCase(item.properties[0])}
            text={saves.join(", ")}
        />
    {/if}
</div>
