<script lang="ts">
    import type StatBlockPlugin from "src/main";

    import DiceRoll from "./DiceRoll.svelte";
    import { getContext } from "svelte";
    import { traitBuilder } from "./helpers";

    export let name: string;
    export let desc: string;
    export let dice: boolean = true;

    const plugin = getContext<StatBlockPlugin>("plugin");

    const builder = (node: HTMLElement, desc: string) => {
        traitBuilder(node, desc, plugin, dice);
    };
</script>

<div class="property">
    <div class="property-name">{name}</div>
    <div class="property-text" use:builder={desc} />
</div>

<style>
    .property-text {
        display: inline;
        white-space: pre-line;
        text-indent: 0;
    }
    .property-name {
        margin: 0;
        margin-right: 0.25em;
        display: inline;
        font-weight: bold;
        font-style: italic;
    }
</style>
