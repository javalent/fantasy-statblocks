import type { Trait } from "@types";
export function toTitleCase(str: string): string {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export function nanoid() {
    return "xyxyxyxyxyxy".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/** Get Modifier for Ability Score */
export function getMod(arg0: number) {
    let mod = Math.floor(((arg0 ?? 10) - 10) / 2);
    return `${mod >= 0 ? "+" : "-"}${Math.abs(mod)}`;
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
    if (property == null) return ``;
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

export function transformTraits(
    monsterTraits: Trait[] = [],
    paramsTraits: { desc: string; name: string }[] | [string, string][] = []
) {
    if (!monsterTraits) monsterTraits = [];
    if (!paramsTraits) paramsTraits = [];
    for (const trait of paramsTraits ?? []) {
        if (!trait) continue;
        if (Array.isArray(trait)) {
            monsterTraits = monsterTraits.filter((t) => t.name != trait[0]);
            monsterTraits.push({
                name: trait[0],
                desc: stringifyWithKeys(trait.slice(1))
            });
        } else if (
            typeof trait == "object" &&
            "name" in trait &&
            "desc" in trait
        ) {
            monsterTraits = monsterTraits.filter((t) => t.name != trait.name);
            monsterTraits.push({
                name: trait.name,
                desc: stringifyWithKeys(trait.desc)
            });
        }
    }
    return monsterTraits;
}
