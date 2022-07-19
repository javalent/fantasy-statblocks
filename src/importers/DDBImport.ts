import type { Monster } from "@types";

const alignmentMap = [
    "Lawful Good",
    "Neutral Good", 
    "Chaotic Good",
    "Lawful Neutral",
    "Neutral",
    "Chaotic Neutral",
    "Lawful Evil",
    "Neutral Evil",
    "Chaotic Evil"
];

function ArmorClass(character)
{
    let ac;

    //highest ac of equipped armor
    let highestArmorAc: number = null;

    character.data.inventory.forEach(element => {
        if (element.definition.filterType == "Armor" && element.equipped) {
            if (element.definition.armorClass != null && element.definition.armorClass > highestArmorAc) {
                highestArmorAc = element.definition.armorClass;
            }
        }
    });

    // calculates unarmored ac if no armor is equipped
    if (highestArmorAc == null) {
        let baseAc = 10;
        
        // add dex mod
        baseAc += Math.floor(character.data.stats[1].value - 10 / 2);

        //if monk add wis mod, if barbarian add con mod
        character.data.classes.forEach(element => {
            if (element.definition.name == "Monk") {
                baseAc += Math.floor(character.data.stats[4].value - 10 / 2);
            }
            else if (element.definition.name == "Barbarian") {
                baseAc += Math.floor(character.data.stats[2].value - 10 / 2);
            }
        });

        ac = baseAc;
    }
    else {
        ac = highestArmorAc;
    }
    return ac;
}

export async function buildMonsterFromDDBFile(
    file: File
): Promise<Monster[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        console.log("dfasmfjlkasdjl;kjf;klasjkl;d");
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
                        console.log("trying");
                        const importedMonster: Monster = {
                            image: null,
                            name: monster.data.name,
                            source: "D&D Beyond",
                            type: monster.data.race.fullName,
                            subtype: "subtype ig",
                            size: "size",
                            alignment: alignmentMap[monster.data.alignmentId],
                            hp: monster.data.baseHitPoints,
                            
                            ac: ArmorClass(monster),
                            speed: monster.data.race.weightSpeeds.normal.walk, //only gettting walk speed atm
                            stats: [
                                monster.data.stats[0].value,
                                monster.data.stats[1].value,
                                monster.data.stats[2].value,
                                monster.data.stats[3].value,
                                monster.data.stats[4].value,
                                monster.data.stats[5].value,
                            ],
                            damage_immunities: "",
                            damage_resistances: "",
                            damage_vulnerabilities: "",
                            condition_immunities: "",
                            senses: "senses",
                            languages: "algn",
                            cr: "cr",
                            bonus_actions: [],
                            reactions: [],
                            legendary_actions: [],
                            spells: [],
                            actions: []
                            
                        };
                        console.log("ddb data = " + importedMonster);
                        importedMonsters.push(importedMonster);
                    } catch (e) {
                        console.log("caught" + e);
                        continue;
                    }
                }

                resolve(importedMonsters);
                console.log("resolved importedMonsters");
            } catch (e) {
                reject();
            }
        };

        reader.readAsText(file);
    });
}
