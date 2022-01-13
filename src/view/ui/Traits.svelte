<script lang="ts">
    import DiceHolder from "./DiceHolder.svelte";

    export let name: string;
    export let desc: string;
</script>

<div class="property">
    <div class="property-name">{name}</div>
    <div class="property-text">
        <DiceHolder property={desc} />
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
