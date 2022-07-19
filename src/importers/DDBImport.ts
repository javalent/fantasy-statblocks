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
        reader.onload = async (event: any) => {
            const importedMonsters: Monster[] = [];
            try {
                const character = JSON.parse(event.target.result);
                   
                    const importedMonster: Monster = {
                        image: character.data.avatarUrl,
                        name: character.data.name,
                        source: "D&D Beyond",
                        type: character.data.race.fullName,
                        subtype: null,
                        size: null,
                        alignment: alignmentMap[character.data.alignmentId],
                        hp: character.data.baseHitPoints,
                        
                        ac: ArmorClass(character),
                        speed: character.data.race.weightSpeeds.normal.walk, //only gettting walk speed atm
                        stats: [
                            character.data.stats[0].value,
                            character.data.stats[1].value,
                            character.data.stats[2].value,
                            character.data.stats[3].value,
                            character.data.stats[4].value,
                            character.data.stats[5].value,
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
                importedMonsters.push(importedMonster);
                   
                resolve(importedMonsters);
            } catch (e) {
                reject();
            }
        }

        reader.readAsText(file);
    });
}
