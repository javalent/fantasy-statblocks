/* import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock"; */
/* import { SpellImporter } from "./SpellImporter";
import { StatBlockImporter } from "./StatBlockImporter"; */

import { Monster, Spell, Trait } from "@types";
import { titleCase } from "title-case";

export const ImportEntitiesFromXml = async (
    ...files: File[]
): Promise<Monster[]> => {
    return new Promise((resolve) => {
        for (let xmlFile of files) {
            const reader = new FileReader();

            reader.onload = async (event: any) => {
                const xml: string = event.target.result;

                const dom = new DOMParser().parseFromString(
                    xml,
                    "application/xml"
                );
                const monsters = dom.getElementsByTagName("monster");
                const importedMonsters: Monster[] = [];
                if (!monsters.length) return;
                for (let monster of Array.from(monsters)) {
                    const importedMonster: Monster = {
                        name: getParameter(monster, "name"),
                        size: getSize(monster),
                        type: getParameter(monster, "type"),
                        subtype: getParameter(monster, "subtype"),
                        alignment: getParameter(monster, "alignment"),
                        ac: getAC(monster),
                        hp: Number(getHP(monster, "hp")),
                        hit_dice: getHP(monster, "hit_dice"),
                        speed: getParameter(monster, "speed"),
                        stats: [
                            Number(getParameter(monster, "str")),
                            Number(getParameter(monster, "dex")),
                            Number(getParameter(monster, "con")),
                            Number(getParameter(monster, "int")),
                            Number(getParameter(monster, "wis")),
                            Number(getParameter(monster, "cha"))
                        ],
                        saves: getSaves(monster),
                        skillsaves: getSkillSaves(monster),
                        damage_vulnerabilities: getParameter(
                            monster,
                            "vulnerable"
                        ),
                        damage_resistances: getParameter(monster, "resist"),
                        damage_immunities: getParameter(monster, "immune"),
                        condition_immunities: getParameter(
                            monster,
                            "conditionImmune"
                        ),
                        senses: getParameter(monster, "senses"),
                        languages: getParameter(monster, "languages"),
                        cr: getParameter(monster, "cr"),
                        traits: getTraits(monster, "trait"),
                        spells: getSpells(monster),
                        actions: getTraits(monster, "action"),
                        legendary_actions: getTraits(monster, "legendary"),
                        reactions: getTraits(monster, "reaction"),
                        source: getSource(monster)
                    };

                    importedMonsters.push(importedMonster);
                }
                resolve(importedMonsters);
            };

            reader.readAsText(xmlFile);
        }
    });
};

function getParameter(monster: Element, tag: string): string {
    const element = monster.getElementsByTagName(tag);
    if (element && element.length) return element[0].textContent;
}
function getTraits(
    monster: Element,
    arg1: "trait" | "action" | "legendary" | "reaction"
): Trait[] {
    if (!monster.getElementsByTagName(arg1)) return [];
    const traits = monster.getElementsByTagName(arg1);
    const traitList = [];
    for (let trait of Array.from(traits)) {
        const name = trait.getElementsByTagName("name");
        if (!name) continue;
        if (name[0].textContent.includes("Spellcasting")) continue;
        const text = [];
        const traitTexts = trait.getElementsByTagName("text");
        for (let index in traitTexts) {
            text.push(traitTexts[index].textContent);
        }
        traitList.push({
            name: name[0].textContent,
            desc: text.join(" ")
        });
    }
    return traitList;
}

function getSpells(monster: Element): Spell[] {
    if (!monster.getElementsByTagName("trait")) return [];
    const traits = Array.from(monster.getElementsByTagName("trait"));
    const spellcasting = traits.find((x) =>
        x.getElementsByTagName("name")[0]?.textContent.includes("Spellcasting")
    );
    if (!spellcasting) return [];
    return Array.from(spellcasting.getElementsByTagName("text"))
        .map((x) => x.textContent.replace(/(&#8226;|•)/u, "").trim())
        .filter((x) => x.length);
}

function getSkillSaves(monster: Element): { [key: string]: number }[] {
    if (!monster.getElementsByTagName("skill")) return [];
    let saves = monster
        .getElementsByTagName("skill")[0]
        .textContent.split(", ");
    let ret: { [key: string]: number }[] = [];
    saves.forEach((save) => {
        const skill = save.split(/\s[\+\-]/);
        ret.push({ [skill[0]]: Number(skill[1]) });
    });
    return ret;
}

const SAVES: Record<
    string,
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma"
> = {
    Str: "strength",
    Dex: "dexterity",
    Con: "constitution",
    Int: "intelligence",
    Wis: "wisdom",
    Cha: "charisma"
};

function getSaves(monster: Element): {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
}[] {
    if (!monster.getElementsByTagName("save")) return [];
    let saves = monster.getElementsByTagName("save")[0].textContent.split(", ");
    let ret: {
        strength?: number;
        dexterity?: number;
        constitution?: number;
        intelligence?: number;
        wisdom?: number;
        charisma?: number;
    }[] = [];
    saves.forEach((save) => {
        const stat = save.split(/\s[\+\-]/);
        ret.push({ [SAVES[stat[0]]]: Number(stat[1]) });
    });
    return ret;
}

function getHP(monster: Element, arg1: "hp" | "hit_dice"): string {
    if (!monster.getElementsByTagName("hp")) return "";
    let [, hp, hit_dice] = monster
        .getElementsByTagName("hp")[0]
        .textContent.match(/(\d+) \(([\s\S]+)\)/);
    return { hp: hp, hit_dice: hit_dice }[arg1];
}
const SIZES: { [key: string]: string } = {
    T: "tiny",
    S: "small",
    M: "medium",
    L: "large",
    H: "huge",
    G: "gargantuan"
};
function getSize(monster: Element): string {
    if (monster.getElementsByTagName("size")) {
        return SIZES[monster.getElementsByTagName("size")[0].textContent] ?? "";
    }
    return "";
}

function getAC(monster: Element): number {
    if (monster.getElementsByTagName("ac")) {
        const [, ac] = monster
            .getElementsByTagName("ac")[0]
            ?.textContent.match(/(\d+)/);
        return Number(ac);
    }
    return 0;
}
function getSource(monster: Element): string {
    let source = "Unknown";
    const description = monster.getElementsByTagName("description");
    if (description && description.length) {
        const searchString = "Source: ";
        const sourcePos = description[0].textContent.lastIndexOf(searchString);
        const sources = description[0].textContent
            .substr(sourcePos + searchString.length)
            .split(/, ?/);
        source = sources[0];
    } else {
        const types = monster.getElementsByTagName("type");
        if (types && types.length) {
            let type = types[0].textContent.split(/, ?/);
            source = titleCase(
                type.length > 1 ? type[type.length - 1] : source
            );
        }
    }
    return source;
}
