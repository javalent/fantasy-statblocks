<script lang="ts">
    import type StatBlockPlugin from "src/main";

    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { StackRoller } from "../../../../obsidian-dice-roller/src/roller/dice";

    export let text: string;
    export let original: string | number = text;

    const dice = getContext<boolean>("dice");

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

    let roller: StackRoller = null;
    let error = false;
    if (!roller && dice) {
        try {
            roller = plugin.getRoller(`${text}`) as StackRoller;
        } catch (e) {
            console.error(e);
            error = true;
        }
    }

    let defaultValue = 0;
    onMount(async () => {
        if (roller) {
            try {
                await roller.roll();
                defaultValue = roller.dice.reduce(
                    (a, dice) =>
                        a +
                        (dice.static
                            ? dice.result
                            : Math.floor(
                                  ((dice.faces.min + dice.faces.max) / 2) *
                                      dice.rolls
                              )),
                    0
                );

                await roller.applyResult({
                    type: "dice",
                    result: defaultValue,
                    tooltip: "Average"
                });
                roller.shouldRender = render;
            } catch (e) {
                error = true;
            }
        }
    });

    const rollerEl = (node: HTMLElement) => {
        if (!roller || !roller.containerEl) {
            node.setText(`${original}`);
        } else {
            node.appendChild(roller.containerEl);
        }
    };
</script>

{#key error}
    {#if error || !dice}
        {text}
    {:else}
        <span class="roller-result" use:rollerEl />
        {#if typeof original == "number" || (original && original.length)}
            <span class="dice-original">({original})</span>
        {/if}
    {/if}
{/key}

<style>
    .roller-result {
        font-weight: var(--active--font-weight);
    }
</style>
