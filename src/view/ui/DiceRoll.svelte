<script lang="ts">
    import type StatBlockPlugin from "src/main";

    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { StackRoller } from "../../../../obsidian-dice-roller/src/roller/dice";

    export let text: string | number;

    const plugin = getContext<StatBlockPlugin>("plugin");
    const render = getContext<boolean>("render");

    const reset = getContext<Writable<boolean>>("reset");

    reset.subscribe(async (v) => {
        if (v)
            await roller.applyResult({
                type: "dice",
                result: defaultValue,
                tooltip: "Average"
            });
    });

    export let roller: StackRoller = null;
    if (!roller && plugin.canUseDiceRoller) {
        roller = plugin.getRoller(`${text}`) as StackRoller;
    }

    let defaultValue = 0;
    onMount(async () => {
        await roller.roll();
        defaultValue = roller.dice.reduce(
            (a, dice) =>
                a +
                (dice.static
                    ? dice.result
                    : Math.ceil(
                          ((dice.faces.min + dice.faces.max) / 2) * dice.rolls
                      )),
            0
        );

        await roller.applyResult({
            type: "dice",
            result: defaultValue,
            tooltip: "Average"
        });
        roller.shouldRender = render;
    });

    const rollerEl = (node: HTMLElement) => {
        node.appendChild(roller.containerEl);
    };
</script>

<span class="roller-result" use:rollerEl />
{#if typeof text == "number" || (text && text.length)}
    <span class="dice-original">({text})</span>
{/if}

<style>
    .roller-result {
        font-weight: 700;
    }
</style>
