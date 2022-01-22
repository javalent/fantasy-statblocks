<script lang="ts">
    export let header: string;
</script>

<h3 class="section-header">
    {header}
</h3>

<style>
    .section-header {
        border-bottom: 1px solid var(--statblock-primary-color);
        color: var(--statblock-primary-color);
        font-size: 21px;
        font-variant: small-caps;
        font-weight: normal;
        letter-spacing: 1px;
        margin: 0;
        margin-bottom: 0.3em;
        break-inside: avoid-column;
        break-after: avoid-column;
    }
</style>
