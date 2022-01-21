<script lang="ts">
    import TextContentHolder from "./TextContentHolder.svelte";

    export let name: string;
    console.log("🚀 ~ file: Traits.svelte ~ line 5 ~ name", name);
    export let desc: string;
    export let render: boolean;
</script>

<div class="property">
    <div class="property-name">{name}</div>
    <div class="property-text">
        <TextContentHolder {render} property={desc} />
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
