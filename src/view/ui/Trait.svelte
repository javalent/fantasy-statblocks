<script lang="ts">
    import type StatBlockPlugin from "src/main";

    import { getContext } from "svelte";
    import type { StackRoller } from "../../../../obsidian-dice-roller/src/roller/dice";

    import DiceRoll from "./DiceRoll.svelte";

    export let trait: string;
    export let dice: boolean;

    const split = trait.split(
        /([\+\-]\d+ to hit|\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)|\w+ [\+\-]\d+)/
    );

    const plugin = getContext<StatBlockPlugin>("plugin");

    const match = (str: string) => {
        return (
            /\w+ [\+\-]\d+/.test(str.trim()) ||
            /[\+\-]\d+ to hit/.test(str.trim()) ||
            /\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)/.test(str.trim())
        );
    };
    const roller = (str: string) => {
        let roller: StackRoller;
        let text: string;
        if (/\w+ [\+\-]\d+/.test(str.trim())) {
            let [, save, sign, number] = str.match(/(\w+ )([\+\-])(\d+)/) ?? [];
            let mult = 1;
            if (sign === "-") {
                mult = -1;
            }
            if (!isNaN(Number(number))) {
                roller = plugin.getRoller(
                    `1d20+${mult * Number(number)}`
                ) as StackRoller;
                text = `${save} ${sign}${number}`;
            }
        } else if (/[\+\-]\d+ to hit/.test(str.trim())) {
            let [, sign, number] = str.match(/([\+\-])(\d+)/) ?? [];

            let mult = 1;
            if (sign === "-") {
                mult = -1;
            }
            if (!isNaN(Number(number))) {
                roller = plugin.getRoller(
                    `1d20+${mult * Number(number)}`
                ) as StackRoller;
                text = str;
            }
        } else if (/\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)/.test(str.trim())) {
            let [, base, dice] =
                str.match(/(\d+)\s\((\d+d\d+(?:\s*[+\-]\s*\d+)?)\)/) ?? [];
            if (!isNaN(Number(base)) && dice) {
                roller = plugin.getRoller(dice) as StackRoller;
                text = dice;
            }
        }
        return { roller, text };
    };
</script>

{#if !dice}
    <span>{trait}</span>
{:else}
    {#each split as str}
        {#if !match(str)}
            <span>{str}</span>
        {:else}
            <DiceRoll {...roller(str)} />
        {/if}
    {/each}
{/if}
