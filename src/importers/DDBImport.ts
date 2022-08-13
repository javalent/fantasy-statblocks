import type { 
    Character,
    Trait 
} from "@types";
import { element } from "svelte/internal";

const alignmentMap = [
    "Lawful-Good",
    "Neutral-Good", 
    "Chaotic-Good",
    "Lawful-Neutral",
    "Neutral",
    "Chaotic-Neutral",
    "Lawful-Evil",
    "Neutral-Evil",
    "Chaotic-Evil"
];

const skills = [
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
    "sleight-of-hand",
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

function GetModifiers(character, type: string) {
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

function GetAbilityMod(value: number) {
    return (value - 10) / 2;
}


function GetArmorClass(character) {
    console.log("getting armor");
    
    let ac;
    const inventory = character.data.inventory;
    //highest ac of equipped armor
    let highestArmorAc: number = null;

    for (const element in inventory) {
        highestArmorAc = inventory[element].definition.filterType == "Armor" && 
            inventory[element].equipped &&
            inventory[element].definition.armorClass != null &&
            inventory[element].definition.armorClass > highestArmorAc ?
            inventory[element].definition.armorClass : highestArmorAc;
    }

    // calculates unarmored ac if no armor is equipped
    if (highestArmorAc == null) {
        let baseAc = 10;
        
        // add dex mod
        baseAc += Math.floor(character.data.stats[1].value - 10 / 2);

        //if monk add wis mod, if barbarian add con mod
        for (const element in character.data.classes) {
            const currentClass = character.data.classes[element].definition.name;
            if (currentClass == "Monk") {
                baseAc += Math.floor(character.data.stats[4].value - 10 / 2);
            }
            else if (currentClass == "Barbarian") {
                baseAc += Math.floor(character.data.stats[2].value - 10 / 2);
            }
        }

        ac = baseAc;
    }
    else {
        ac = highestArmorAc;
    }
    return ac;
}

function GetLevel(character) {
    console.log("getting level");
    
    var level: number = 0;

    for (let key in character.data.classes) {        
        level = level + character.data.classes[key].level;
    }
    
    return level;
}

function GetLanguages(character) {
    console.log("languages");
    
    const modifiers = GetModifiers(character, "language");
    let languages = [];

    for (const key in modifiers) {
        languages.push(modifiers[key].friendlySubtypeName);
    }
    return languages;
}

function GetImmunities(character) {
    console.log("immunities");
    
    const modifiers = GetModifiers(character, "immunity");
    let immunities = [];

    for (const key in modifiers) {
        immunities.push(modifiers[key].friendlySubtypeName);
    }
    return immunities;
}

function GetResistances(character) {
    console.log("getting resistances");
    
    const modifiers = GetModifiers(character, "resistance");
    let resistances = [];

    for (const element in modifiers) {
        resistances.push(modifiers[element].friendlySubtypeName);
        console.log(modifiers[element].friendlySubtypeName);
    }
    return resistances;
}

function GetVulnerabilities(character) {
    console.log("getting vulnerabiilties");
    
    const modifiers = GetModifiers(character, "vulnerability");
    let vulnerabilities = [];

    console.log("after get modifiers");
    
    for (const key in modifiers) {
        vulnerabilities.push(modifiers[key].friendlySubtypeName);
    }
    return vulnerabilities;
}

function GetSavingThrows (character, proficiency_bonus) {
    const proficiencies = GetModifiers(character, "proficiency");
    
    var saves: number[] = [0, 0, 0, 0, 0, 0];
    
    for (const element in saves) {
        saves[element] = GetAbilityMod(character.data.stats[element].value);
    }
    
    for (const element in proficiencies) {
        saves[0] += proficiencies[element].subType == "strength-saving-throws" ? proficiency_bonus : 0;
        saves[1] += proficiencies[element].subType == "dexterity-saving-throws" ? proficiency_bonus : 0;
        saves[2] += proficiencies[element].subType == "constitution-saving-throws" ? proficiency_bonus : 0;
        saves[3] += proficiencies[element].subType == "intelligence-saving-throws" ? proficiency_bonus : 0;
        saves[4] += proficiencies[element].subType == "wisdom-saving-throws" ? proficiency_bonus : 0;
        saves[5] += proficiencies[element].subType == "charisma-saving-throws" ? proficiency_bonus : 0;
    }

    return saves;
}

function GetSkills (character) {    
    const modifiers = GetModifiers(character, "proficiency");
    const proficiency_bonus = Math.floor(2 + (GetLevel(character) - 1) / 4);
    let _skills: any[] = [];
    
    for (const element in modifiers) {
        if (skills.includes(modifiers[element].subType)) {
            _skills[skills.indexOf(modifiers[element].subType)] = proficiency_bonus;
        }
    }
    
    for (const element in skills) {
        _skills[element] = _skills[element] ?? 0;
        _skills[element] += character.data.stats[skillsAbilityMap[element]].value;
        _skills[element] = GetAbilityMod(_skills[element]).toString().includes("-") ? 
            GetAbilityMod(_skills[element]) : 
            "+" + GetAbilityMod(_skills[element]);
    }

    return _skills;
}

function GetSenses(character) {
    console.log("senses");
    
    const modifiers = GetModifiers(character, "set-base");
    let senses = [];
    let passivePerceptionNum;

    for (const element in modifiers) {
        if (modifiers[element].subType == "darkvision")
        {
            senses.push("Darkvision " + modifiers[element].value + "ft.");
        }
    }

    passivePerceptionNum = GetSkills(character)[skills.indexOf("perception")]; 
    senses.push("Passive Perception " + passivePerceptionNum.toString());
    
    return senses;
}

function GetProficiencies (character) {
    console.log("proficiencies");
    
    const modifiers = GetModifiers(character, "proficiency");
    let proficiencies = [];

    for (const element in modifiers) {
        if (
            !skills.includes(modifiers[element].subType) && 
            !modifiers[element].subType.includes("saving-throws") && 
            !modifiers[element].subType.includes("skill") &&
            !modifiers[element].subType.includes("choose")
            ) {                
                proficiencies.push(modifiers[element].friendlySubtypeName) 
            }
    }

    return proficiencies;
}

function GetTraits (character) {    
    let traits: Trait[] = [];
    let traitLocations = [character.data.race.racialTraits];

    for (let element in character.data.classes) {
        traitLocations.push(character.data.classes[element].classFeatures);
    }    

    const actions = GetActions(character, Math.floor(2 + (GetLevel(character) - 1) / 4));
    for (let element in traitLocations) {
        const traitLocation = traitLocations[element];
        for (let key in traitLocation) {       
            let trait = traitLocation[key].definition;
                        
            if (
                !trait.hideInSheet && 
                trait.name != "Ability Score Improvement" &&
                !actions.includes(trait.name)
                ) 
            {
                let desc = trait.snippet;
                desc.replace("<p>", "");
                
                const traitObj: Trait = {
                    name: trait.name,
                    desc: desc
                };

                traits.push(traitObj);
            }
        }
    }

    let backgroundTrait: Trait = {
        name: character.data.background.definition.featureName,
        desc: character.data.background.definition.featureDescription
    };
    traits.push(backgroundTrait);

    return traits;
}

function GetActions (character, proficiency_bonus) {
    console.log("actions");
    
    var actions: Trait[] = [];
    const inventory = character.data.inventory;
    const actionsLocations = [character.data.actions.class, character.data.actions.race, character.data.actions.background, character.data.actions.item, character.data.actions.feat];
    for (const element in inventory) {
        console.log("in first for loop");
        
        const inventoryItem = inventory[element].definition;

        console.log(inventoryItem.name);
        
        if (inventory[element].definition.filterType == "Weapon")
        {
            let desc: string;
            
            // get hit/dc and damage bonus
            const properties = inventoryItem.properties;
            let finesse: boolean = false;
            let bonus: number = 0;
            
            // add either str or dex mod. str if dex is lower or if the weapon is finesse
            for (const element in properties) {
                finesse = properties[element].name == "Finesse" ? true : finesse;
            }          
            bonus += 
                character.data.stats[0].value > character.data.stats[1].value || !finesse ?
                GetAbilityMod(character.data.stats[0].value) :
                GetAbilityMod(character.data.stats[1].value);

            //adds magical bonuses to +1 weapons
            for (const element in inventoryItem.grantedModifiers) {
                bonus += inventoryItem.grantedModifiers[element].type == "bonus" ? 
                    inventoryItem.grantedModifiers[element].value : 0;
            }            
            
            const damageAverage = inventoryItem.damage.diceValue * inventoryItem.damage.diceCount / 2 + bonus;            
            
            desc = "+" + (bonus + proficiency_bonus).toString() + " to hit, "
            + "reach " + inventoryItem.range.toString() + " ft."
            + " Hit: " + damageAverage.toString() + " (" + inventoryItem.damage.diceString + " + " + bonus.toString() + ")"
            + " " + inventoryItem.damageType + " damage";
            
            const action: Trait = {
                name: inventoryItem.name,
                desc: desc.toString()
            };
            console.log(action.name + " " + action.desc);
            
            
            actions.push(action);
            console.log("pushed action to actions");
            
        }
    }
    
    for (const element in actionsLocations) {
        const actionsLocationsElement = actionsLocations[element];
        
        for (const key in actionsLocationsElement) {   
            
            const action: Trait = {
                name: actionsLocationsElement[key].name,
                desc: actionsLocationsElement[key].snippet.replace("{{scalevalue}}", actionsLocationsElement[key].dice.diceString   )
            };

            actions.push(action);
        }
    }

    return actions;
}

function GetInventory (character) {
    console.log("inventory");
    
    let items: string[] = [];
    const inventory = character.data.inventory;

    for (const element in inventory) {
        let item: string;
        item = inventory[element].quantity > 1 ? 
            inventory[element].quantity.toString() + " " :
            "";

      //  const name = 
        //    inventory[element].definition.name.includes(",") ? 
          //  inventory[element].definition.name.split(", ")[1] + " " + inventory[element].definition.name.split(",")[0] :
           // inventory[element].definition.name;
        item += inventory[element].definition.name;
        item += inventory[element].quantity > 1 ? "s" : "";

        items.push(item);
    }

    return items;
}

function GetBackground (character) {    
    let background: Trait = {
        name: character.data.background.definition.name,
        desc: character.data.background.definition.shortDescription
    };
    return background;
}

function GetClasses (character) {
    let classes: string[] = [];
    const classesLocation = character.data.classes;

    for (var element in classesLocation)
    {
        classes.push(classesLocation[element].definition.name);
    }

    return classes;
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
                    console.log("Importing " + character.data.name);
                    
                    const level = GetLevel(character);
                    const proficiency_bonus = Math.floor(2 + (level - 1) / 4);
                    const importedMonster: Character = {
                        image: character.data.avatarUrl,
                        name: character.data.name,
                        gender: character.data.gender,
                        race: character.data.race.fullName,
                        class: GetClasses(character).join("/"),
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
                        inspiration: character.data.inspiration ? "[x]" : "[ ]",
                        hp: character.data.baseHitPoints - character.data.removedHitPoints,
                        max_hp: character.data.baseHitPoints,
                        hit_dice: GetLevel(character),
                        saving_throws: GetSavingThrows(character, proficiency_bonus),
                        skills: GetSkills(character),
                        initiative: Math.floor((character.data.stats[1] - 10) / 2),
                        ac: GetArmorClass(character),
                        vulnerabilities: GetVulnerabilities(character).join(", "),  
                        resistances: GetResistances(character).join(", "),
                        immunities: GetImmunities(character).join(", "),
                        senses: GetSenses(character).join(", "),
                        proficiencies: GetProficiencies(character).join(", "),
                        languages: GetLanguages(character).join(", "),
                        actions: GetActions(character, proficiency_bonus),
                        inventory: GetInventory(character).join (" | "),
                        traits: GetTraits(character),
                        background: GetBackground(character).name,
                        alignment: alignmentMap[character.data.alignmentId],
                        eyes: character.data.eyes,
                        size: character.data.race.size ?? "Medium",
                        height: character.data.height,
                        faith: character.data.faith,
                        hair: character.data.hair,
                        skin: character.data.skin,
                        age: character.data.age,
                        weight: character.data.weight,
                        personality_traits: "- " + character.data.traits.personalityTraits.replaceAll("\n", "\n - "),
                        ideals: "- " + character.data.traits.ideals.replaceAll("\n", "\n- "),
                        bonds: "- " + character.data.traits.bonds.replaceAll("\n", "\n- "),
                        flaws: "- " + character.data.traits.flaws.replaceAll("\n", "\n- "),
                        appearance: character.data.traits.appearance,
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
