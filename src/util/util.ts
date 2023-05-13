import { EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import copy from "fast-copy";
import type { Trait } from "index";
import { basicSetup } from "src/util/editor/extensions";
import { materialPalenight } from "src/util/editor/theme-dark";
import { basicLightTheme } from "src/util/editor/theme-light";
export function editorFromTextArea(
    textarea: HTMLTextAreaElement,
    facet?: Extension
) {
    if (document.body.hasClass("theme-dark")) {
        basicSetup.push(materialPalenight);
    } else {
        basicSetup.push(basicLightTheme);
    }
    const extensions = [...basicSetup];
    if (facet) extensions.push(facet);
    let view = new EditorView({
        state: EditorState.create({
            doc: textarea.value,
            extensions
        })
    });
    textarea.parentNode!.appendChild(view.dom);
    textarea.style.display = "none";
    if (textarea.form)
        textarea.form.addEventListener("submit", () => {
            textarea.value = view.state.doc.toString();
        });
    return view;
}
export function slugify(str: string) {
    if (!str) return "";
    return str
        .toLowerCase()
        .replace(/[^A-Za-z0-9\s_-]/g, "")
        .replace(/\s+/g, "-");
}

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

/** Attempt to convert a string into a link, while maintaining any whitespace. **/
export function linkify(input: string, context: string): string {
    let trimmed = input.trim();
    if (app.metadataCache.getFirstLinkpathDest(trimmed, context) != null) {
        return input.replace(
            trimmed,
            `<STATBLOCK-LINK>${trimmed}</STATBLOCK-LINK>`
        );
    }
    return input;
}
export const linkifySpells = (spells: string, context: string): string => {
    return spells
        .split(",")
        .map((spell) => linkify(spell, context))
        .join(",");
};
export function stringify(
    property: Record<string, any> | string | any[] | number | boolean,
    depth: number = 0,
    joiner: string = " ",
    parens = true
): string {
    const ret = [];
    if (depth == 5) {
        return "";
    }
    if (property == null) return ``;
    if (typeof property == "string") return property;
    if (typeof property == "number") return `${property}`;
    if (Array.isArray(property)) {
        ret.push(
            `${parens ? "(" : ""}${property
                .map((p) => stringify(p, depth++))
                .join(joiner)}${parens ? ")" : ""}`
        );
    } else if (typeof property == "object") {
        for (const value of Object.values(property)) {
            ret.push(stringify(value, depth++));
        }
    }
    return ret.join(" ");
}
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
    paramsTraits:
        | { desc: string; name: string; traits?: Trait[] }[]
        | [string, string][] = []
) {
    if (!monsterTraits) monsterTraits = [];
    if (!Array.isArray(monsterTraits)) monsterTraits = [monsterTraits];
    if (!paramsTraits) paramsTraits = [];
    if (!Array.isArray(paramsTraits)) paramsTraits = [paramsTraits];
    for (const trait of paramsTraits ?? []) {
        if (!trait) continue;
        if (Array.isArray(trait)) {
            let desc = stringifyWithKeys(trait.slice(1));
            monsterTraits = monsterTraits.filter(
                (t) => t.name != trait[0] && t.desc != desc
            );
            monsterTraits.push({
                name: trait[0],
                desc
            });
        } else if (
            typeof trait == "object" &&
            ("name" in trait || "desc" in trait)
        ) {
            monsterTraits = monsterTraits.filter(
                (t) =>
                    (!t.name?.length || t.name != trait.name) &&
                    t.desc != trait.desc
            );
            monsterTraits.push({
                ...trait,
                name: trait.name,
                desc: stringifyWithKeys(trait.desc)
            });
        }
    }
    return monsterTraits;
}

export function append(
    property: string | any[],
    toAppend: string | any[]
): string | any[] {
    if (
        (!Array.isArray(property) && typeof property !== "string") ||
        (!Array.isArray(toAppend) && typeof toAppend !== "string")
    ) {
        return toAppend;
    }
    let appended = copy(property);
    if (Array.isArray(appended)) {
        if (Array.isArray(toAppend)) {
            return [...appended, ...toAppend];
        }
        if (typeof toAppend == "string") {
            appended.push(toAppend);
            return appended;
        }
    } else if (typeof appended == "string") {
        return `${appended} ${stringify(toAppend)}`;
    }
    return toAppend;
}
