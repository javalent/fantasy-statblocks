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

export const stringify = (
    property: Record<string, any> | string | any[] | number | boolean,
    depth: number = 0
): string => {
    const ret = [];
    if (depth == 5) {
        return "";
    }
    if (!property || property == null) return ``;
    if (typeof property == "string") return property;
    if (typeof property == "number") return `${property}`;
    if (Array.isArray(property)) {
        ret.push(`(${property.map((p) => stringify(p, depth++)).join(" ")})`);
    } else if (typeof property == "object") {
        for (const value of Object.values(property)) {
            ret.push(stringify(value, depth++));
        }
    }
    return ret.join(" ");
};
export const stringifyWithKeys = (
    property: Record<string, any> | string | any[] | number | boolean,
    depth: number = 0
): string => {
    const ret = [];
    if (depth == 5) {
        return "";
    }
    if (!property || property == null) return ``;
    if (typeof property == "string") return property;
    if (typeof property == "number") return `${property}`;
    if (Array.isArray(property)) {
        ret.push(
            `${property.map((p) => stringifyWithKeys(p, depth++)).join(" ")}`
        );
    } else if (typeof property == "object") {
        for (const [key, value] of Object.entries(property)) {
            ret.push(
                stringifyWithKeys(key, depth++),
                stringifyWithKeys(value, depth++)
            );
        }
    }
    return ret.join(" ");
};
