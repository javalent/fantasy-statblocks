<script lang="ts">
        import { getContext } from "svelte";
    import Trait from "./Trait.svelte";

    export let name: string;
    export let desc: string;
    export let dice: boolean = true;

    let canDice = getContext<boolean>("dice");
</script>

<div class="property">
    <div class="property-name">{name}</div>
    <div class="property-text">
        <Trait trait={desc} dice={dice && canDice} />
    </div>
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
