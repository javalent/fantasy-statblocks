import type { Monster } from "@types";

const alignmentMap: {
    1: "Lawful Good",
    2: "Neutral Good", 
    3: "Chaotic Good",
    4: "Lawful Neutral",
    5: "Neutral",
    6: "Chaotic Neutral",
    7: "Lawful Evil",
    8: "Neutral Evil",
    9: "Chaotic Evil"
};

function ArmorClass(character)
{
    let highestAc = null;
    for (let i = 0; i < character.data.inventory.length; i++) {
        const inventoryItem = character.data.inventory[i];
        if (inventoryItem.definition.filterType == "Armor" && inventoryItem.equipped) {
            if (inventoryItem.definition.armorClass != null && inventoryItem.definition.armorClass > highestAc) {
                highestAc = inventoryItem;
            }
        }
    }
    character.data.inv.forEach(element => {
        
    });
    return highestAc;
}

export async function buildMonsterFromDDBFile(
    file: File
): Promise<Monster[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event: any) => {
            const importedMonsters: Monster[] = [];
            try {
                const parsed = JSON.parse(event.target.result);
                let monsters = [];
                if (parsed.creatures) {
                    monsters = parsed.creatures;
                } else {
                    monsters = [parsed];
                }
                for (let monster of monsters) {

                    try {
                        const importedMonster: Monster = {
                            image: null,
                            name: monster.data.name,
                            source: "D&D Beyond",
                            type: monster.data.race.fullName,
                            subtype: null,
                            size: monster.data.race.size,
                            alignment: alignmentMap[monster.data.alignmentId],
                            hp: monster.data.baseHitPoints,
                            hit_dice: monster.data.classes.level.toString() + "d" + monster.data.classes.definition.hitDice.toString(),
                            ac: "armor class", //can't find ac in JSON, it seems it must be manually calculated using the inventory & stats
                            speed: monster.data.race.weightSpeeds.normal.walk, //speed is hard to access
                            stats: [
                                monster.data.stats.0.value,
                                monster.data.stats.1.value,
                                monster.data.stats.2.value,
                                monster.data.stats.3.value,
                                monster.data.stats.4.value,
                                monster.data.stats.5.value,
                            ],
                            damage_immunities: "damage immunities",
                            damage_resistances: "damage resistances",
                            damage_vulnerabilities: "damage vulnerabilities",
                            condition_immunities: "condition immunities",
                            saves: "saves",
                            skillsaves: "skillsaves"                                
                            senses:
                                monster.stats.senses?.join(", ").trim() ?? "",
                            languages:
                                monster.stats.languages?.join(", ").trim() ??
                                "",
                            cr: monster.stats.challengeRating ?? "",
                            traits:
                                monster.stats.additionalAbilities?.map(
                                    (trait: {
                                        name: string;
                                        description: string;
                                    }) => {
                                        return {
                                            name: trait.name,
                                            desc: trait.description.replace(
                                                /<[^>]*>/g,
                                                ""
                                            )
                                        };
                                    }
                                ) ?? [],
                            actions:
                                monster.stats.actions?.map(
                                    (trait: {
                                        name: string;
                                        description: string;
                                    }) => {
                                        return {
                                            name: trait.name,
                                            desc: trait.description.replace(
                                                /<[^>]*>/g,
                                                ""
                                            )
                                        };
                                    }
                                ) ?? [],
                            reactions:
                                monster.stats.reactions?.map(
                                    (trait: {
                                        name: string;
                                        description: string;
                                    }) => {
                                        return {
                                            name: trait.name,
                                            desc: trait.description.replace(
                                                /<[^>]*>/g,
                                                ""
                                            )
                                        };
                                    }
                                ) ?? [],
                            legendary_actions:
                                monster.stats.legendaryActions?.map(
                                    (trait: {
                                        name: string;
                                        description: string;
                                    }) => {
                                        return {
                                            name: trait.name,
                                            desc: trait.description.replace(
                                                /<[^>]*>/g,
                                                ""
                                            )
                                        };
                                    }
                                ) ?? []
                        };
                        importedMonsters.push(importedMonster);
                    } catch (e) {
                        continue;
                    }
                }

                resolve(importedMonsters);
            } catch (e) {
                reject();
            }
        };

        reader.readAsText(file);
    });
}
