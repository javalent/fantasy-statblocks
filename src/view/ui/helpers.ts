import DiceRoll from "./DiceRoll.svelte";
import type StatBlockPlugin from "src/main";

export const traitBuilder = (
    node: HTMLElement,
    desc: string,
    plugin: StatBlockPlugin,
    dice: boolean
) => {
    if (!plugin.canUseDiceRoller || !dice) {
        node.setText(desc);
        return;
    }

    const holder = createSpan();

    const split = desc.split(
        /([\+\-]\d+ to hit|\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)|\w+ [\+\-]\d+)/
    );

    for (let str of split) {
        if (/\w+ [\+\-]\d+/.test(str.trim())) {
            let [, text, sign, number] =
                str.match(/(\w+\s)([\+\-])(\d+)/) ?? [];
            let mult = 1;
            if (sign === "-") {
                mult = -1;
            }
            holder.createSpan({ text });
            if (!isNaN(Number(number))) {
                const roller = plugin.getRoller(
                    `1d20+${mult * Number(number)}`
                );
                new DiceRoll({
                    target: holder,
                    props: {
                        defaultValue: Math.ceil(10.5 + mult * Number(number)),
                        text: `${sign}${number}`,
                        roller
                    }
                });
                continue;
            }
        } else if (/[\+\-]\d+ to hit/.test(str.trim())) {
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
                        defaultValue: Math.ceil(10.5 + mult * Number(number)),
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
