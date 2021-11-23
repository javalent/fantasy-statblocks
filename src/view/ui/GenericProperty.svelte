<script lang="ts">
    export let property: string;
    export let text: string | number;
</script>

<div class="line">
    <span class="property-name">{property}</span>
    <span class="property-text">
        <slot>
            {text}
        </slot>
    </span>
</div>

<style>
    .line {
        line-height: 1.4;
        display: block;
        color: var(--statblock-primary-color);
    }
    .property-name {
        margin: 0;
        margin-right: 0.25em;
        display: inline;
        font-weight: bold;
    }
    .property-text {
        display: inline;
        margin: 0;
    }
</style>
