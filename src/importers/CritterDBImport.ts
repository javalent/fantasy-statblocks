import { Monster } from "@types";

export const ImportFromCritterDB = async (
    ...files: File[]
): Promise<Map<string, Monster>> => {
    const importedMonsters: Map<string, Monster> = new Map();
    for (let file of files) {
        try {
            const monster = await buildMonsterFromFile(file);
            importedMonsters.set(monster.name, monster);
        } catch (e) {}
    }
    return importedMonsters;
};

async function buildMonsterFromFile(file: File): Promise<Monster> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event: any) => {
            try {
                const monster = JSON.parse(event.target.result);

                const importedMonster: Monster = {
                    name: monster.name,
                    source: "CritterDB",
                    type: monster.stats.race,
                    subtype: "",
                    size: monster.stats.size,
                    alignment: monster.stats.alignment,
                    hp: monster.stats.hitPoints,
                    hit_dice: monster.stats.hitPointsStr,
                    ac: monster.stats.armorClass,
                    speed: monster.stats.speed,
                    stats: [
                        monster.stats.abilityScores.strength,
                        monster.stats.abilityScores.dexterity,
                        monster.stats.abilityScores.constitution,
                        monster.stats.abilityScores.intelligence,
                        monster.stats.abilityScores.wisdom,
                        monster.stats.abilityScores.charisma
                    ],
                    damage_immunities:
                        monster.stats.damageImmunities
                            ?.join("; ")
                            .toLowerCase()
                            .trim() ?? "",
                    damage_resistances:
                        monster.stats.damageResistances
                            ?.join(", ")
                            .toLowerCase()
                            .trim() ?? "",
                    damage_vulnerabilities:
                        monster.stats.damageVulnerabilities
                            ?.join(", ")
                            .toLowerCase()
                            .trim() ?? "",
                    condition_immunities:
                        monster.stats.conditionImmunities
                            ?.join(", ")
                            .toLowerCase()
                            .trim() ?? "",
                    saves: monster.stats.savingThrows?.map(
                        (thr: {
                            ability: keyof Monster["saves"];
                            value: number;
                        }) => {
                            return { [thr.ability]: thr.value };
                        }
                    ),
                    skillsaves:
                        monster.stats.skills?.map(
                            ({
                                name,
                                value
                            }: {
                                name: string;
                                value: number;
                            }) => {
                                return {
                                    [name]: value
                                };
                            }
                        ) ?? [],
                    senses: monster.stats.senses?.join(", ").trim() ?? "",
                    languages: monster.stats.languages?.join(", ").trim() ?? "",
                    cr: monster.stats.challengeRating ?? "",
                    traits:
                        monster.stats.additionalAbilities?.map(
                            (trait: { name: string; description: string }) => {
                                return {
                                    name: trait.name,
                                    desc: trait.description
                                };
                            }
                        ) ?? [],
                    actions:
                        monster.stats.actions?.map(
                            (trait: { name: string; description: string }) => {
                                return {
                                    name: trait.name,
                                    desc: trait.description
                                };
                            }
                        ) ?? [],
                    reactions:
                        monster.stats.reactions?.map(
                            (trait: { name: string; description: string }) => {
                                return {
                                    name: trait.name,
                                    desc: trait.description
                                };
                            }
                        ) ?? [],
                    legendary_actions:
                        monster.stats.legendaryActions?.map(
                            (trait: { name: string; description: string }) => {
                                return {
                                    name: trait.name,
                                    desc: trait.description
                                };
                            }
                        ) ?? []
                };

                resolve(importedMonster);
            } catch (e) {
                reject();
            }
        };

        reader.readAsText(file);
    });
}
