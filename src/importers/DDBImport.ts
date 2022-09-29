import type { 
    Character,
    Trait 
} from "@types";

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
const currencyMap: string[] = [
    "cp",
    "sp",
    "gp",
    "ep",
    "pp"
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
    return Math.floor((value - 10) / 2);
}


function GetArmorClass(character) {    
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
    var level: number = 0;

    for (let key in character.data.classes) {        
        level = level + character.data.classes[key].level;
    }
    
    return level;
}

function GetLanguages(character) {    
    const modifiers = GetModifiers(character, "language");
    let languages = [];

    for (const key in modifiers) {
        languages.push(modifiers[key].friendlySubtypeName);
    }
    return languages;
}

function GetImmunities(character) {    
    const modifiers = GetModifiers(character, "immunity");
    let immunities = [];

    for (const key in modifiers) {
        immunities.push(modifiers[key].friendlySubtypeName);
    }
    return immunities;
}

function GetResistances(character) {    
    const modifiers = GetModifiers(character, "resistance");
    let resistances = [];

    for (const element in modifiers) {
        resistances.push(modifiers[element].friendlySubtypeName);
    }
    return resistances;
}

function GetVulnerabilities(character) {    
    const modifiers = GetModifiers(character, "vulnerability");
    let vulnerabilities = [];
    
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

    for (const element in character.data.classes) {
        traitLocations.push(character.data.classes[element].classFeatures);
    }    

    const actions = GetActions(character, Math.floor(2 + (GetLevel(character) - 1) / 4));
    for (const element in traitLocations) {
        const traitLocation = traitLocations[element];
        for (const key in traitLocation) {
            const trait = traitLocation[key].definition;            
            if (
                    !trait.hideInSheet && 
                    trait.name != "Ability Score Improvement" &&
                    !actions.includes(trait.name) &&
                    trait.snippet != null &&
                    trait.snippet != ""
                ) 
            {
                                
                const traitObj: Trait = {
                    name: trait.name,
                    desc: trait.snippet
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

function GetActions (character, proficiency_bonus): Trait[] {    
    var actions: Trait[] = [];
    const inventory = character.data.inventory;
    const actionsLocations = [character.data.actions.class, character.data.actions.race, character.data.actions.background, character.data.actions.item, character.data.actions.feat];

    actions.push(GetUnarmedStrike(character, proficiency_bonus));
    for (const element in inventory) {        
        const inventoryItem = inventory[element].definition;
        
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
            actions.push(action);            
        }
    }
    
    for (const element in actionsLocations) {
        const actionsLocationsElement = actionsLocations[element];
        
        for (const key in actionsLocationsElement) {   
                        
            const action: Trait = {
                name: actionsLocationsElement[key].name,
                desc: actionsLocationsElement[key].snippet
            };

            actions.push(action);
        }
        
    }    

    return actions;
}

function GetUnarmedStrike (character: any, proficiency_bonus: number) {
    let desc: string;
    let bonus: number = 0;
    
    bonus += GetAbilityMod(character.data.stats[0].value);
    
    desc = "+" + (bonus + proficiency_bonus).toString() + " to hit, "
    + "reach 5 ft."
    + " Hit: " + (1 + bonus)
    + " Bludeoning damage";
    
    const action: Trait = {
        name: "Unarmed Strike",
        desc: desc.toString()
    };
    
    return action;
}

function GetInventory (character) {    
    let items: string[] = [];
    const inventory = character.data.inventory;

    for (const element in inventory) {
        let item: string;
        item = inventory[element].quantity > 1 ? 
            inventory[element].quantity.toString() + " " :
            "";
        item += inventory[element].definition.name;
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

function getHitDice (character, total: boolean) {
    let hitDice: string[] = [];

    for (const element in character.data.classes) {
        const _class = character.data.classes[element];

        const hitDie = total ? 
            _class.level + "d" + _class.definition.hitDice :
            (_class.level - _class.hitDiceUsed) + "d" + _class.definition.hitDice;
        
        let dieMerged: boolean = false;
        for (const key in hitDice) {
            if (hitDice[key] == hitDie) {
                const split = hitDice[key].split("d")
                hitDice[key] = (+split[0] + +hitDie.split("d")[0]).toString() + "d" + split[1];
                dieMerged = true;
                break;
            }
        }
        if (!dieMerged) {
            hitDice.push(hitDie);
        }
    }

    return hitDice;
}

function GetCurrency(character): string[] {
    let currency: string[] = [];
    const currencies = [
        character.data.currencies.cp, 
        character.data.currencies.sp, 
        character.data.currencies.gp, 
        character.data.currencies.ep, 
        character.data.currencies.pp
    ];

    for (const element in currencies) {
        if (currencies[element]) {
            currency.push(currencies[element] + " " + currencyMap[element]);
        }
    }
    return currency;
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
                    const level = GetLevel(character);
                    const proficiency_bonus = Math.floor(2 + (level - 1) / 4);

                    const importedMonster: Character = {
                        image: character.data.decorations.avatarUrl,
                        name: character.data.name,
                        gender: character.data.gender,
                        race: character.data.race.fullName,
                        class: GetClasses(character).join("/"),
                        level: GetLevel(character),
                        xp: character.data.currentXp,
                        stats: [
                            character.data.stats[0].value,
                            character.data.stats[1].value,
                            character.data.stats[2].value,
                            character.data.stats[3].value,
                            character.data.stats[4].value,
                            character.data.stats[5].value,
                        ],
                        proficiency_bonus: proficiency_bonus,
                        speed: character.data.race.weightSpeeds.normal.walk,
                        inspiration: character.data.inspiration ? "- [x] **Inspiration**" : "- [ ] **Inspiration**",
                        hp: character.data.baseHitPoints - character.data.removedHitPoints,
                        max_hp: character.data.baseHitPoints,
                        temp_hp: character.data.temporaryHitPoints,
                        hit_dice: getHitDice(character, false).join(" + "),
                        hit_dice_total: getHitDice(character, true).join(" + "),
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
                        currencies: GetCurrency(character).join (" + "),
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
                importedMonsters.push(importedMonster);
                
                resolve(importedMonsters);
            } catch (e) {
                reject();
            }
        }

        reader.readAsText(file);
    });
}

/*
function ProcessSnippet(trait: any, character: any): Trait {
    trait.snippet = trait.snippet.replaceAll("scalevalue", trait.dice.diceString);
    trait.snippet = trait.snippet.replaceAll("(classlevel/2)", TraitClassLevel(trait, character)/2); trait = trait.snippet.replaceAll("classlevel/2", TraitClassLevel(trait, character)/2); trait = trait.snippet.replaceAll("(classlevel", TraitClassLevel(trait, character)); trait = trait.snippet.replaceAll("classlevel", TraitClassLevel(trait, character)); trait = trait.snippet.replaceAll("classlevel", TraitClassLevel(trait, character));
    trait.snippet = trait.snippet.replaceAll("@roundup", TraitRoundup)
    trait.snippet = trait.snippet.replaceAll("{{", ""); trait = trait.snippet.replaceAll("}}", "");

    const _trait: Trait = {
        name: trait.name,
        desc: trait.snippet
    }
    return _trait;
}

function TraitRoundup (trait: any) {
    const roundupIndex: number = trait.name.indexOf("@roundup");
    const name: string = trait.name;
    let number = "";

    for (let i = roundupIndex; i < 0; i--) {
        const element = name.charAt(i);
        if (isNaN(parseInt(element))) {
            break;
        }
        element.toString() + number;
    }

    return Math.ceil(+number);
}
function TraitClassLevel (trait: any, character: any) {
    for (const element in character.classes) {
        const characterClass = character.classes[element];
        for (const key in characterClass.classFeatures) {
            if (characterClass.classFeatures[key].definition.name == trait.name) {
                return characterClass.level;
            }
        }
    }
}
*/
