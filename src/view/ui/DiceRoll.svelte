<script lang="ts">
    import type StatBlockPlugin from "src/main";

    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { StackRoller } from "../../../../obsidian-dice-roller/src/roller/dice";
    import { ExpectedValue } from "obsidian-overload";

    export let text: string;
    export let original: string | number = text;

    const dice = getContext<boolean>("dice");

    const plugin = getContext<StatBlockPlugin>("plugin");
    const render = getContext<boolean>("render");

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

    onMount(async () => {
        if (roller) {
            try {
                /** Don't render the first roll. */
                await roller.roll();
                roller.shouldRender = render;
            } catch (e) {
                error = true;
            }
        }
    });

    const reset = getContext<Writable<boolean>>("reset");

    reset.subscribe(async (v) => {
        if (v) {
            roller.shouldRender = false;
            roller.expectedValue = ExpectedValue.Average;
            await roller.roll();
            roller.shouldRender = render;
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
        font-weight: var(--active-font-weight);
    }
</style>
