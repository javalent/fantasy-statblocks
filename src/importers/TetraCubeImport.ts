import type { Monster, Spell, Trait } from "@types";
import { CR, DiceBySize } from "src/data/constants";
import { getModAsNumber } from "src/util/util";
const SAVES: Record<
    string,
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma"
> = {
    str: "strength",
    dex: "dexterity",
    con: "constitution",
    int: "intelligence",
    wis: "wisdom",
    cha: "charisma"
};

export async function buildMonsterFromTetraCube(
    file: File
): Promise<Monster[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const monsterMap: Monster[] = [];
        reader.onload = async (event: any) => {
            try {
                let json = JSON.parse(event.target.result);
                let monsters;
                if ("monster" in json) {
                    monsters = json.monster;
                } else if (Array.isArray(json)) {
                    monsters = json;
                } else if (typeof json == "object") {
                    monsters = [json];
                } else {
                    reject("Invalid monster JSON provided.");
                }
                const imported: Monster[] = [];
                for (const monster of monsters) {
                    try {
                        const importedMonster: Monster = {
                            image: null,
                            name: monster.name,
                            source: "TetraCube",
                            type: monster.type,
                            subtype: "",
                            size: monster.size,
                            alignment: monster.alignment,
                            hp: getHP(monster)?.hp,
                            hit_dice: getHP(monster)?.dice,
                            ac: (monster.ac ?? [])[0]?.ac ?? "",
                            speed: getSpeedString(monster),
                            stats: [
                                monster.strPoints,
                                monster.dexPoints,
                                monster.conPoints,
                                monster.intPoints,
                                monster.wisPoints,
                                monster.chaPoints
                            ],
                            damage_immunities: parseImmune(monster, "i"),
                            damage_resistances: parseImmune(monster, "r"),
                            damage_vulnerabilities: parseImmune(monster, "v"),
                            condition_immunities: parseConditions(monster),
                            saves: getSaves(monster),
                            skillsaves: getSkills(monster),
                            senses: getSenses(monster),
                            languages: getLanguages(monster),
                            cr: monster.cr ?? "",
                            traits: getTraits(monster.abilities),
                            actions: getTraits(monster.actions),
                            reactions: getTraits(monster.reactions),
                            legendary_actions: getTraits(monster.legendaries),
                            spells: getSpells(monster.abilities)
                        };
                        imported.push(importedMonster);
                    } catch (e) {
                        continue;
                    }
                }

                resolve(imported);
            } catch (e) {
                console.error(`reject!!!`, e);
                reject(e);
            }
        };

        reader.readAsText(file);
    });
}
function getHP(monster: any): { hp?: number; dice?: string } {
    if (
        monster.customHP ||
        (monster.hitDice && /(\d+) \((.+)\)/.test(monster.hpText))
    ) {
        const [_, hp, dice] = monster.hpText.match(/(\d+) \((.+)\)/) ?? [];
        return { hp, dice };
    }
    if (monster.hitDice) {
        const hitdice = Number(monster.hitDice);
        const size = DiceBySize[monster.size] ?? DiceBySize["medium"];
        const con = getModAsNumber(Number(monster.conPoints) ?? 0);

        const hp = (hitdice * size) / (2 + 0.5) + con * hitdice;

        const func = con > 0 ? "+" : "-";
        const conString = con == 0 ? "" : ` ${func} ${con * hitdice}`;

        return { hp, dice: `${hitdice}d${size}${conString}` };
    }
}

function getSpeedString(monster: any): string {
    if (monster.customSpeed) return monster.speedDesc;
    let speeds = [monster.speed + " ft."];
    if (monster.burrowSpeed > 0)
        speeds.push("burrow " + monster.burrowSpeed + " ft.");
    if (monster.climbSpeed > 0)
        speeds.push("climb " + monster.climbSpeed + " ft.");
    if (monster.flySpeed > 0)
        speeds.push(
            "fly " +
                monster.flySpeed +
                " ft." +
                (monster.hover ? " (hover)" : "")
        );
    if (monster.swimSpeed > 0)
        speeds.push("swim " + monster.swimSpeed + " ft.");
    return speeds.join(", ");
}

function parseImmune(monster: any, type: string): string {
    let damagetypes = [];
    if ("damagetypes" in monster) {
        damagetypes.push(
            ...monster.damagetypes.find((t: any) => t.type == type)
        );
    }
    let specialdamage = [];
    if ("specialdamage" in monster) {
        specialdamage.push(
            ...monster.damagetypes.find((t: any) => t.type == type)
        );
    }
    return [damagetypes.join(", "), specialdamage.join(", ")].join("; ");
}
function getLanguages(monster: any): string {
    const languages = [];
    const speaksLanguages = [],
        understandsLanguages = [];
    for (let index = 0; index < monster.languages.length; index++) {
        const language = monster.languages[index];
        if (language.speaks || language.speaks == undefined)
            speaksLanguages.push(language);
        else understandsLanguages.push(language);
    }
    if (speaksLanguages.length > 0) {
        languages.push(
            [
                speaksLanguages.slice(0, speaksLanguages.length - 2).join(", "),
                speaksLanguages.slice(-1)
            ].join(" and ")
        );
    }

    if (understandsLanguages.length > 0) {
        languages.push(
            [
                understandsLanguages
                    .slice(0, understandsLanguages.length - 2)
                    .join(", "),
                understandsLanguages.slice(-1)
            ].join(" and ")
        );
    }

    if (monster.telepathy > 0)
        languages.push("telepathy " + monster.telepathy + " ft.");
    if (languages.length == 0) languages.push("&mdash;");
    return languages.join("; ");
}
function getSenses(monster: any): string {
    let senses = [];
    if (monster.blindsight > 0)
        senses.push(
            "blindsight " +
                monster.blindsight +
                " ft." +
                (monster.blind ? " (blind beyond this radius)" : "")
        );
    if (monster.darkvision > 0)
        senses.push("darkvision " + monster.darkvision + " ft.");
    if (monster.tremorsense > 0)
        senses.push("tremorsense " + monster.tremorsense + " ft.");
    if (monster.truesight > 0)
        senses.push("truesight " + monster.truesight + " ft.");

    // Passive Perception
    let ppData = monster.skills.find(
            (skill: any) => skill.name == "perception"
        ),
        pp = 10 + getModAsNumber(monster.wisPoints);
    if (ppData != null) pp += getProf(monster) * ("note" in ppData ? 2 : 1);
    senses.push("passive Perception " + pp);
    return senses.join(", ");
}

function getTraits(abilities: any): Trait[] {
    if (!abilities || !abilities.length) return;
    const traits = abilities
        .filter((ability: Trait) => ability.name != "Spellcasting")
        .map((ability: Trait) => {
            return {
                name: ability.name,
                desc: ability.desc.replace(/_/g, "")
            };
        });
    return traits;
}

function getSpells(monster: any): Spell[] {
    if (!monster.abilities || !monster.abilities.length) return;
    let { desc } =
        monster.abilities.find(
            (ability: Trait) => ability.name == "Spellcasting"
        ) ?? {};
    if (!desc) return;
    const [, save] = desc.match(/\[(\w{3}) SAVE\]/) ?? [];
    if (save) {
        const prof = getProf(monster);
        const stat = monster[`${save.toLowerCase()}Points`];
        if (stat && !isNaN(Number(stat))) {
            const mod = getModAsNumber(Number(stat));
            const spellsave = 8 + mod + prof;
            const attack = mod + prof;
            desc = desc.replace(/\[\w+ SAVE\]/, spellsave);
            desc = desc.replace(/\[\w+ ATK\]/, `+${attack}`);
        }
    }
    const spells = desc
        .replace(/(_|>\s)/g, "")
        .split("\n")
        .filter((desc: string) => desc.length)
        .trim();

    return spells;
}
function getSaves(monster: any): {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
}[] {
    if (
        !("sthrows" in monster) ||
        !Array.isArray(monster.sthrows) ||
        !monster.sthrows.length
    )
        return [];
    const prof = getProf(monster);
    const saves = [];
    for (const save of monster.sthrows) {
        const name = save.name;
        const mod = getModAsNumber(Number(monster[`${name}Points`]));
        if (isNaN(mod)) continue;
        saves.push({ [SAVES[save]]: mod });
    }
    return saves;
}

function getSkills(monster: any): { [key: string]: number }[] {
    if (
        !("skills" in monster) ||
        !Array.isArray(monster.skills) ||
        !monster.skills.length
    )
        return [];
    const skills = [];
    const prof = getProf(monster);
    for (const skill of monster.skills) {
        const stat = skill.stat;
        const mod = getModAsNumber(Number(monster[`${stat}Points`]));
        if (isNaN(mod)) continue;

        const exp = "note" in skill;

        skills.push({ [skill.name]: prof + mod + mod * Number(exp) });
    }
    return skills;
}

function getProf(monster: any) {
    if (monster.cr == "*") return monster.customProf;
    if ("cr" in monster && monster.cr in CR) {
        return Math.max(
            Math.floor(2 + ((CR[monster.cr]?.value ?? 0) - 1) / 4),
            2
        );
    }
    return 0;
}
function parseConditions(monster: any): string {
    if ("conditions" in monster) {
        return monster.conditions.map((c: any) => c.name).join(", ");
    }
}
