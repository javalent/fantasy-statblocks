<script lang="ts">
    import type { DiceParsing } from "src/layouts/layout.types";

    export let item: DiceParsing;
</script>

<div class="dice-parsing">
    <code>/{item.regex}/</code>
</div>
