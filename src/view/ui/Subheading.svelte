<script lang="ts">
    import type { Monster } from "@types";
    import type { SubHeadingItem } from "src/data/constants";

    const stringify = (
        property: Record<string, any> | string | any[] | number | boolean,
        depth: number = 0
    ): string => {
        const ret = [];
        if (depth == 5) {
            return "";
        }
        if (typeof property == "string") return property;
        if (typeof property == "number") return `${property}`;
        if (Array.isArray(property)) {
            ret.push(
                `(${property.map((p) => stringify(p, depth++)).join(" ")})`
            );
        } else if (typeof property == "object") {
            for (const value of Object.values(property)) {
                ret.push(stringify(value, depth++));
            }
        }
        return ret.join(" ");
    };

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
        {subheading.join(" ")}
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
