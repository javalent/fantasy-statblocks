import type { 
    ability, 
    Character, 
    Monster 
} from "@types";
import type Saves from "src/view/ui/Saves.svelte";

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

const skills: [
    "acrobatics",
    "animal-handling",
    "arcana",
    "athletics",
    "deception",
    "history",
    "insight",
    "intimidation",
    "investigation",
    "medicine",
    "nature",
    "perception",
    "performance",
    "persuasion",
    "religion",
    "slight-of-hand",
    "stealth",
    "survival"
];

const skillsAbilityMap: number[] = [
    1,
    4,
    3,
    0,
    5,
    3,
    4,
    5,
    3,
    4,
    3,
    4,
    5,
    4,
    3,
    1,
    1,
    4
];

function GetModifiers(character, type) {
    let modifiers: any[] = [];
    let locations = [character.data.modifiers.race, character.data.modifiers.class, character.data.modifiers.background];

    locations.forEach(element => {

        for (let key in element) {
            let value = element[key];
            if (value.type == type) {
                modifiers.push(value)
            }
        }

    });
    return modifiers;
}

function GetArmorClass(character) {
    console.log("getting armor");
    
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

function GetClasses(character) {    
    var classes: string[];

    for (var key in character.data.classes) {        
        var value = character.data.classes[key];
        
        classes.push(value.definition.name);        
    }
    return classes.join("/");
}

function GetLevel(character) {
    console.log("getting level");
    
    var level: number;
    for (var key in character.data.classes) {
        var value = character.data.classes[key];
        
        level += value.level;
    }

    return level;
}

function GetLanguages(character) {
    const languageMods = GetModifiers(character, "language");
    let languages: string[];

    languages.forEach(element => {
        languages[element] = languageMods[element].friendlySubtypeName;
    });
    return languages.join(", ");
}

function GetImmunities(character) {
    const immunityMods = GetModifiers(character, "immunity");
    let immunities: string[];

    immunityMods.forEach(element => {
        immunities[element] = immunityMods[element].friendlySubtypeName;
    });
    return immunities.join(", ");
}

function GetResistances(character) {
    const resistanceMods = GetModifiers(character, "resistance");
    let resistances: string[];

    resistanceMods.forEach(element => {
        resistances[element] = resistanceMods[element].friendlySubtypeName;
    });
    return resistances.join(", ");
}

function GetVulnerabilities(character) {
    const vulnerabilitiesMods = GetModifiers(character, "vulnerability");
    let vulnerabilities: string[];

    vulnerabilitiesMods.forEach(element => {
        vulnerabilities[element] = vulnerabilitiesMods[element].friendlySubtypeName;
    });
    return vulnerabilities.join(", ");
}

function GetSavingThrows (character, proficiency_bonus) {
    const proficiencies = GetModifiers(character, "proficiency");
    var saves: [number, number, number, number, number, number];

    saves.forEach(element => {
        saves[element] = character.data.stats[element].value;
    });
    proficiencies.forEach(element => {
        saves[0] += element.subType == "strength-saving-throws" ? proficiency_bonus : 0;
        saves[1] += element.subType == "dexterity-saving-throws" ? proficiency_bonus : 0;
        saves[2] += element.subType == "constitution-saving-throws" ? proficiency_bonus : 0;
        saves[3] += element.subType == "intelligence-saving-throws" ? proficiency_bonus : 0;
        saves[4] += element.subType == "wisdom-saving-throws" ? proficiency_bonus : 0;
        saves[5] += element.subType == "charisma-saving-throws" ? proficiency_bonus : 0;
    });

    return saves;
}

function GetSkills (character) {
    const modifiers = GetModifiers(character, "proficiency");
    const proficiency_bonus = Math.floor(2 + (GetLevel(character) - 1) / 4);
    let _skills: number[];

    modifiers.forEach(element => {
        if (skills.contains(modifiers[element].subType)) {
            _skills[skills.indexOf(modifiers[element].subType)] += proficiency_bonus;
        }
    });

    for (let index = 0; index < skills.length; index++) {
        _skills[index] += character.data.stats[skillsAbilityMap[index]].value;
    }
    return _skills;
}

function GetSenses(character) {
    const modifiers = GetModifiers(character, "set-base");
    let senses: string[];
    let passivePerceptionNum: number;

    modifiers.forEach(element => {
        if (modifiers[element].subType == "darkvision")
        {
            senses.push(modifiers[element].friendlySubtypeName);
        }
    });

    passivePerceptionNum = GetSkills(character)[skills.indexOf("perception")]; //10 + character.data.stats[4];
    senses.push("Passive Perception " + passivePerceptionNum.toString());
    
    return senses;
}

function GetProficiencies (character) {
    const modifiers = GetModifiers(character, "proficiency");
    let proficiencies: string[];

    modifiers.forEach(element => {
        if (
            !skills.contains(modifiers[element].subType) && 
            !modifiers[element].subType.contains("saving-throws") && 
            !modifiers[element].subType.contains("skill")
            )
            proficiencies.push(modifiers[element])
    });

    return proficiencies;
}

function GetActions (character) {
    const inventory = character.data.inventory;

    inventory.forEach(element => {
        if (element.definition)
    });
}

export async function buildMonsterFromDDBFile(
    file: File
): Promise<Character[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event: any) => {
            const importedMonsters: Character[] = [];
            try {
                const character = JSON.parse(event.target.result);
                   console.log("in DDBImport.ts, character name is" + character.data.name);
                    const proficiency_bonus = Math.floor(2 + (GetLevel(character) - 1) / 4);
                    const importedMonster: Character = {
                        image: character.data.avatarUrl,
                        name: character.data.name,
                        gender: character.data.gender,
                        race: character.data.race.fullName,
                        class: GetClasses(character),
                        level: GetLevel(character),
                        stats: [
                            character.data.stats[0].value,
                            character.data.stats[1].value,
                            character.data.stats[2].value,
                            character.data.stats[3].value,
                            character.data.stats[4].value,
                            character.data.stats[5].value,
                        ],
                        proficiency_bonus: proficiency_bonus,
                        speed: character.data.race.weightSpeeds.normal.walk, //only gettting walk speed atm
                        inspiration: character.data.inspiration ? "x" : "",
                        hp: character.data.baseHitPoints - character.data.removedHitPoints,
                        max_hp: character.data.baseHitPoints,
                        hit_dice: GetLevel(character),
                        saves: GetSavingThrows(character, Math.floor(2 + (GetLevel(character) - 1) / 4)),
                        skills: GetSkills(character),
                        initiative: Math.floor((character.data.stats[1] - 10) / 2),
                        ac: GetArmorClass(character),
                        vulnerabilities: GetVulnerabilities(character),  
                        resistances: GetResistances(character),
                        immunities: GetImmunities(character),
                        senses: GetSenses(character).join(", "),
                        proficiencies: GetProficiencies(character).join(", "),
                        languages: GetLanguages(character),
                        actions: [],
                        bonus_actions: [],
                        reactions: [],
                        inventory:
                        traits:
                        background:
                        alignment: alignmentMap[character.data.alignmentId],
                        eyes:
                        size: character.data.race.size ?? "Medium",
                        height:
                        faith:
                        hair:
                        skin:
                        age:
                        weight:
                        personality_traits:
                        ideals:
                        bonds:
                        flaws:
                        appearance:
                        spells: [],
                        source: "D&D Beyond"                
                    };
                console.log("ended character import, about to push and resolve");
                
                importedMonsters.push(importedMonster);
                
                resolve(importedMonsters);
            } catch (e) {
                reject();
            }
        }

        reader.readAsText(file);
    });
}
