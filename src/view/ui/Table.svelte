<script lang="ts">
    import type { Monster } from "@types";
    import type { TableItem } from "src/data/constants";

    export let monster: Monster;
    export let item: TableItem;

    const customMod = new Function('stat', `return ${item.modifier}`);

    function getMod(stat: number) {        
        let mod = item.modifier == null || !item.modifier.length || item.modifier == ""? 
            Math.floor(((stat ?? 10) - 10) / 2) : 
            customMod(stat);
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
    {#each values.slice(0, headers.length) as value, index}
        <div class="table-item">
            <span class="statblock-table-header">
                {`${headers[index]}`.toUpperCase()}
            </span>
            <span>
                {value}
                {#if item.calculate}
                    <span>
                        ({getMod(value)})
                    </span>
                {/if}
            </span>
        </div>
    {/each}
</div>

<style>
    .statblock-table-header {
        font-weight: bold;
    }
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
