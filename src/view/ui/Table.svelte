<script lang="ts">
    import type { Monster } from "@types";
    import type { StatblockItem } from "src/data/constants";

    export let monster: Monster;
    export let item: StatblockItem;

    function getMod(stat: number) {
        let mod = Math.floor(((stat ?? 10) - 10) / 2);
        return `${mod >= 0 ? "+" : "-"}${Math.abs(mod)}`;
    }

    let values: any[] = monster[item.properties[0]] as any[];
    if (!Array.isArray(values)) {
        values = [];
    }

    const headers = item.headers ?? [
        ...Array(values.length > 0 ? values.length : 1).keys()
    ];
</script>

<div class="table">
    {#each values as value, index}
        <div class="table-item">
            <strong>{`${headers[index]}`.toUpperCase()}</strong>
            <span>{value} ({getMod(value)})</span>
        </div>
    {/each}
</div>

<style>
    .table {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        flex-wrap: wrap;
    }
    .table-item {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-flow: column nowrap;
    }
</style>
