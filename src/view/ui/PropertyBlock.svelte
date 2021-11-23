<script lang="ts">
    import type StatBlockPlugin from "src/main";

    import DiceRoll from "./DiceRoll.svelte";
    import { getContext } from "svelte";

    export let name: string;
    export let desc: string;
    export let dice: boolean = true;

    const plugin = getContext<StatBlockPlugin>("plugin");

    const traitBuilder = (node: HTMLElement, desc: string) => {
        if (!plugin.canUseDiceRoller || !dice) {
            node.setText(desc);
            return;
        }

        const holder = createSpan();

        const split = desc.split(
            /([\+\-]\d+ to hit|\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\))/
        );

        for (let str of split) {
            if (/[\+\-]\d+ to hit/.test(str.trim())) {
                let [, sign, number] = str.match(/([\+\-])(\d+)/) ?? [];

                let mult = 1;
                if (sign === "-") {
                    mult = -1;
                }

                if (!isNaN(Number(number))) {
                    const roller = plugin.getRoller(
                        `1d20+${mult * Number(number)}`
                    );
                    new DiceRoll({
                        target: holder,
                        props: {
                            defaultValue: Math.ceil(
                                10.5 + mult * Number(number)
                            ),
                            text: str,
                            roller
                        }
                    });
                    continue;
                }
            } else if (/\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)/.test(str.trim())) {
                let [, base, dice] =
                    str.match(/(\d+)\s\((\d+d\d+(?:\s*[+\-]\s*\d+)?)\)/) ?? [];

                if (!isNaN(Number(base)) && dice) {
                    const roller = plugin.getRoller(dice);
                    new DiceRoll({
                        target: holder,
                        props: {
                            defaultValue: Number(base),
                            text: dice,
                            roller
                        }
                    });
                    continue;
                }
            }
            holder.appendText(str);
        }

        node.appendChild(holder);
    };
</script>

<div class="property">
    <div class="property-name">{name}</div>
    <div class="property-text" use:traitBuilder={desc} />
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
