import { Spell, Monster, Trait } from "@types";
import { parseYaml } from "obsidian";

export function toTitleCase(str: string): string {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

/** Get Modifier for Ability Score */
export function getMod(arg0: any) {
    let mod = Math.floor(((arg0 ?? 10) - 10) / 2);
    return `${mod >= 0 ? "+" : "-"}${Math.abs(mod)}`;
}

type YamlTrait = [string, ...{ [key: string]: any }[]];
/** Parse Yaml-Defined Trait to Trait */
export function parseTrait(arg: YamlTrait): Trait {
    if (!arg || !(arg instanceof Array)) return;
    if (!arg.length) return;

    const name = arg[0];
    const desc = arg
        .slice(1)
        .map((d) =>
            typeof d === "string"
                ? d
                : `${Object.keys(d)[0]}: ${Object.values(d)[0]}`
        )
        .join(", ")
        .trim();

    return {
        name: name,
        desc: desc
    };
}

export function getParamsFromSource(source: string): Monster {
    const params = parseYaml(source);

    const traits: Trait[] = [];
    const actions: Trait[] = [];
    const reactions: Trait[] = [];
    const legendary_actions: Trait[] = [];
    try {
        (params?.traits || []).forEach((trait: YamlTrait) => {
            let t = parseTrait(trait);
            if (!t) return;
            traits.push(t);
        });
    } catch (e) {
        throw new Error("There was an error parsing the provided traits.");
    }
    try {
        (params?.actions || []).forEach((trait: YamlTrait) => {
            let t = parseTrait(trait);
            if (!t) return;
            actions.push(t);
        });
    } catch (e) {
        throw new Error("There was an error parsing the provided actions.");
    }
    try {
        (params?.reactions || []).forEach((trait: YamlTrait) => {
            let t = parseTrait(trait);
            if (!t) return;
            reactions.push(t);
        });
    } catch (e) {
        throw new Error("There was an error parsing the provided reactions.");
    }
    try {
        (params?.legendary_actions || []).forEach((trait: YamlTrait) => {
            let t = parseTrait(trait);
            if (!t) return;
            legendary_actions.push(t);
        });
    } catch (e) {
        throw new Error(
            "There was an error parsing the provided legendary actions."
        );
    }

    return { ...params, traits, actions, reactions, legendary_actions };
}

export function traitMapFrom(traits: Trait[] = []): Map<string, Trait> {
    return new Map(traits.map((t) => [t.name, t]));
}
export function spellArrayFrom(arg0: Trait): Spell[] {
    const { desc } = arg0;
    if (!desc) return [];

    return desc
        .split("\n")
        .filter((d) => d.trim().length)
        .map((d) => d.trim())
        .map((spell) => {
            if (/^•\s?([\d\w\s\(\)]+):/.test(spell)) {
                const [, level, spellList] = spell.match(
                    /^•\s?([\d\w\s\(\)]+):\s?([\s\S]+?)$/
                );
                return {
                    [level]: spellList
                };
            }
            return spell;
        });
}

export function getColumns(contentEl: HTMLElement) {
    let width = contentEl?.getBoundingClientRect()?.width || 400;
    return Math.floor(width / 400);
}

export function catchError(
    target: any,
    name: string,
    descriptor: PropertyDescriptor
) {
    const original = descriptor.value;
    if (typeof original === "function") {
        descriptor.value = function (...args: any[]) {
            try {
                return original.apply(this, args);
            } catch (e) {
                //throw error here
                renderError(
                    this.contentEl.parentElement,
                    `Error in ${name}: ${e.message}`
                );
            }
        };
    }
}

export function catchErrorAsync(
    target: any,
    name: string,
    descriptor: PropertyDescriptor
) {
    const original = descriptor.value;
    if (typeof original === "function") {
        descriptor.value = async function (...args: any[]) {
            try {
                return await original.apply(this, args);
            } catch (e) {
                //throw error here
                renderError(
                    this.contentEl.parentElement,
                    `Error in ${name}: ${e.message}`
                );
            }
        };
    }
}

export function renderError(el: HTMLElement, error: string): void {
    let pre = createEl("pre");
    pre.setText(`\`\`\`statblock
There was an error rendering the statblock:
${error}
\`\`\``);
    el.replaceWith(pre);
}
