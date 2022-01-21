import type { Monster, Trait } from "@types";
import { parseYaml } from "obsidian";

export function toTitleCase(str: string): string {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

/** Get Modifier for Ability Score */
export function getMod(arg0: number) {
    let mod = Math.floor(((arg0 ?? 10) - 10) / 2);
    return `${mod >= 0 ? "+" : "-"}${Math.abs(mod)}`;
}

export function getParamsFromSource(source: string): Monster {
    let params = parseYaml(source);

    //replace escapes
    params = JSON.parse(JSON.stringify(params).replace(/\\/g, ""));

    return params ?? {};
}

export function traitMapFrom(traits: Trait[] = []): Map<string, Trait> {
    return new Map(traits.map((t) => [t.name, t]));
}
