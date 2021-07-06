import { Monster } from "@types";

export const ImportFromCritterDB = async (
    ...files: File[]
): Promise<Map<string, Monster>> => {
    let importedMonsters: Map<string, Monster> = new Map();
    for (let file of files) {
        try {
            const monsters = await buildMonsterFromFile(file);
            importedMonsters = new Map([...importedMonsters, ...monsters]);
        } catch (e) {}
    }
    return importedMonsters;
};

async function buildMonsterFromFile(file: File): Promise<Map<string, Monster>> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event: any) => {
            const importedMonsters: Map<string, Monster> = new Map();
            try {
                const parsed = JSON.parse(event.target.result);
                let monsters = [];
                if (parsed.creatures) {
                    monsters = parsed.creatures;
                } else {
                    monsters = [parsed];
                }
                for (let monster of monsters) {
                    const importedMonster: Monster = {
                        name: monster.name,
                        source: "CritterDB",
                        type: monster.stats.race,
                        subtype: "",
                        size: monster.stats.size,
                        alignment: monster.stats.alignment,
                        hp: monster.stats.hitPoints,
                        hit_dice: `${Math.floor(
                            monster.stats.extraHealthFromConstitution /
                                monster.stats.abilityScoreModifiers.constitution
                        )}d${monster.stats.hitDieSize} + ${
                            monster.stats.extraHealthFromConstitution
                        }`,
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
                            monster.stats.skills
                                ?.map(
                                    ({
                                        name,
                                        value,
                                        modifier
                                    }: {
                                        name: string;
                                        value: number;
                                        modifier: number;
                                    }) => {
                                        if (!value && !modifier) return;
                                        return {
                                            [name]: value ?? modifier
                                        };
                                    }
                                )
                                .filter((x: any) => x) ?? [],
                        senses: monster.stats.senses?.join(", ").trim() ?? "",
                        languages:
                            monster.stats.languages?.join(", ").trim() ?? "",
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
                    importedMonsters.set(importedMonster.name, importedMonster);
                }

                resolve(importedMonsters);
            } catch (e) {
                reject();
            }
        };

        reader.readAsText(file);
    });
}
