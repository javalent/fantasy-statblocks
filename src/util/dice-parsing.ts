import type { DiceParsing, Layout, ParsedDice } from "types/layout";
import { nanoid } from "./util";
import type { Monster } from "index";

export function parseForDice(
    layout: Layout,
    property: string,
    monster: Monster
): ParsedDice[] {
    const regexes: Map<string, RegExp> = new Map();
    const parsers: Map<string, Function> = new Map();
    const diceParsing = layout.diceParsing ?? getDiceParsingDefaults();
    for (const entry of diceParsing) {
        regexes.set(entry.id, new RegExp(entry.regex));
        let scoped = `
let anon = (original, matches, monster) => {
    ${entry.parser};
}
let result;
try {
    result = anon(original, matches, monster);
} catch(e) {
    console.error(e);
    result = original;
} finally {
    return result;
}
        `;
        const func = new Function("original", "matches", "monster", scoped);
        parsers.set(entry.id, func);
    }

    for (const { id } of diceParsing) {
        const regex = regexes.get(id);
        property = property.replaceAll(new RegExp(regex, "g"), (str) => {
            return `<MATCHED_DICE><ID>${id}<ID>${str}<MATCHED_DICE>`;
        });
    }

    const result = [];
    for (const line of property.split(/(<MATCHED_DICE>.+?<MATCHED_DICE>)/)) {
        if (!/<MATCHED_DICE>.+?<MATCHED_DICE>/.test(line)) {
            result.push(line);
            continue;
        }
        const [, id, prop] =
            line.match(/<MATCHED_DICE><ID>(.+?)<ID>(.+)<MATCHED_DICE>/) ?? [];
        if (!id || !prop) {
            result.push(line);
            continue;
        }
        const regex = regexes.get(id);
        const parser = parsers.get(id);
        const matches = prop.match(regex);
        const res = parser.call(undefined, prop, matches, monster);

        if (
            !res ||
            !res.text ||
            typeof res.text != "string" ||
            !res.text.length
        ) {
            result.push(prop);
        } else {
            result.push(res);
        }
    }

    return result;
}

export function getDiceParsingDefaults(): DiceParsing[] {
    return [
        {
            regex: /([\+\-]\d+) to hit/.source,
            parser: `let [, sign, number] = matches;
let mult = 1;
if (sign === "-") {
    mult = -1;
}
if (!isNaN(Number(number))) {
    text = \`1d20+\${mult * Number(number)}\`;
    original = prop;
}
return { text, original };`,
            id: nanoid()
        },
        {
            regex: /\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)/.source,
            parser: `let [, base, dice] = matches;
if (!isNaN(Number(base)) && dice) {
    text = dice;
}
return { text, original: dice ?? original };`,
            id: nanoid()
        },
        {
            regex: /. ([\+\-]\d+)/.source,
            parser: `let [, save, sign, number] = matches;
let mult = 1;
if (sign === "-") {
    mult = -1;
}
if (!isNaN(Number(number))) {
    text = \`1d20+\${mult * Number(number)}\`;
    original = \`\${save} \${sign}\${number}\`;
}
return { text, original };`,
            id: nanoid()
        }
    ];
}
