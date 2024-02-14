<script lang="ts">
    import type { DiceParsing } from "types/layout";

    export let item: DiceParsing;
</script>

<div class="dice-parsing">
    <code>/{item.regex}/</code>
</div>
