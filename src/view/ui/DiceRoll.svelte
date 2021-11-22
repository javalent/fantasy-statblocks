<script lang="ts">
    import type StatBlockPlugin from "src/main";

    import { getContext, onMount } from "svelte";
    import type { BasicRoller } from "../../../../obsidian-dice-roller/src/roller/roller";

    export let defaultValue: number;
    export let text: string | number;

    const plugin = getContext<StatBlockPlugin>("plugin");

    let roller: BasicRoller;
    if (plugin.canUseDiceRoller) {
        roller = plugin.getRoller(`${text}`);
    }

    onMount(async () => {
        await roller.roll();
        await roller.applyResult({
            type: "dice",
            result: defaultValue,
            tooltip: "Average"
        });
    });

    const rollerEl = (node: HTMLElement) => {
        node.appendChild(roller.containerEl);
    };
</script>

<span class="roller-result" use:rollerEl />
<span class="dice-original">({text})</span>

<style>
</style>
