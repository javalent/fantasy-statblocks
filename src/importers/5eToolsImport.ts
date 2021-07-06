import { Monster } from "@types";

export const ImportFrom5eTools = async (
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

const abilityMap: { [key: string]: string } = {
    str: "strength",
    dex: "dexterity",
    con: "constitution",
    wis: "wisdom",
    int: "intelligence",
    cha: "charisma"
};

async function buildMonsterFromFile(file: File): Promise<Monster> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event: any) => {
            try {
                const monster = JSON.parse(event.target.result);

                const importedMonster: Monster = {
                    name: monster.name,
                    source: `${
                        SOURCE_JSON_TO_FULL[monster.source] ?? "5e.tools"
                    }`,
                    type: monster.type,
                    subtype: "",
                    size: SIZE_ABV_TO_FULL[monster.size],
                    alignment: getAlignmentString(monster),
                    hp: monster.hp?.average ?? "",
                    hit_dice: monster.hp?.formula ?? "",
                    ac: (monster.ac ?? [])[0]?.ac ?? "",
                    speed: getSpeedString(monster),
                    stats: [
                        monster.str,
                        monster.dex,
                        monster.con,
                        monster.int,
                        monster.wis,
                        monster.cha
                    ],
                    damage_immunities: parseImmune(monster.immune),
                    damage_resistances: parseImmune(monster.resist),
                    damage_vulnerabilities: parseImmune(monster.vulnerable),
                    condition_immunities: parseImmune(monster.conditionImmune),
                    saves: Object.entries(monster.save ?? {}).map(
                        (
                            thr: [
                                ability: keyof typeof abilityMap,
                                value: string
                            ]
                        ) => {
                            const [, v] = thr[1].match(/.*(\d+)/);
                            return { [abilityMap[thr[0]]]: v };
                        }
                    ),
                    skillsaves: Object.fromEntries(
                        Object.entries(monster.skill ?? {}).map(
                            ([name, value]) => {
                                const [, v] = value.match(/.*(\d+)/);
                                return [name, v];
                            }
                        )
                    ),
                    senses: monster.senses?.join(", ").trim() ?? "",
                    languages: monster.languages?.join(", ").trim() ?? "",
                    cr: monster.cr ? monster.cr.cr || monster.cr : "",
                    traits:
                        monster.trait?.map(
                            (trait: { name: string; entries: string[] }) => {
                                return {
                                    name: trait.name,
                                    desc: trait.entries.join("\n")
                                };
                            }
                        ) ?? [],
                    actions:
                        monster.action?.map(
                            (trait: { name: string; entries: string[] }) => {
                                return {
                                    name: trait.name,
                                    desc: trait.entries.join("\n")
                                };
                            }
                        ) ?? [],
                    reactions:
                        monster.reaction?.map(
                            (trait: { name: string; entries: string[] }) => {
                                return {
                                    name: trait.name,
                                    desc: trait.entries.join("\n")
                                };
                            }
                        ) ?? [],
                    legendary_actions:
                        monster.legendary?.map(
                            (trait: { name: string; entries: string[] }) => {
                                return {
                                    name: trait.name,
                                    desc: trait.entries.join("\n")
                                };
                            }
                        ) ?? [],
                    spells: getSpells(monster)
                };

                resolve(importedMonster);
            } catch (e) {
                reject();
            }
        };

        reader.readAsText(file);
    });
}

function parseImmune(immune: any[]): string {
    if (!immune) return "";
    const ret = [];
    for (let imm of immune) {
        if (typeof imm == "string") ret.push(imm);
        if (imm.immune) {
            ret.push(imm.immune.join(", ") + imm.note ? ` ${imm.note}` : "");
        }
    }
    return ret.join(", ");
}
const spellMap: { [key: string]: string } = {
    "0": "Cantrips (at will)",
    "1": "1st level",
    "2": "2nd level",
    "3": "3rd level",
    "4": "4th level",
    "5": "5th level",
    "6": "6th level",
    "7": "7th level",
    "8": "8th level",
    "9": "9th level"
};
function getSpells(monster: any): any[] {
    if (!monster.spellcasting || !monster.spellcasting.length) return [];

    return [
        monster.spellcasting[0].headerEntries.join("\n"),
        ...Object.entries(monster.spellcasting[0].spells).map(
            ([level, { slots, spells }]) => {
                let name = `${spellMap[level]}`;
                name += slots != undefined ? ` (${slots} slots)` : "";

                const sp = spells
                    .join(", ")
                    .replace(/\{@spell ([\s\S]+?)\}/g, `$1`);
                return { [name]: sp };
            }
        )
    ];
}

function getAlignmentString(alignment: any) {
    if (!alignment) return null; // used in sidekicks
    if (typeof alignment === "object") {
        if (alignment.special != null) {
            // use in MTF Sacred Statue
            return alignment.special;
        } else {
            // e.g. `{alignment: ["N", "G"], chance: 50}` or `{alignment: ["N", "G"]}`
            return `${(alignment.alignment ?? [])
                .map((a: any) => getAlignmentString(a))
                .join(" ")}${
                alignment.chance ? ` (${alignment.chance}%)` : ""
            }${alignment.note ? ` (${alignment.note})` : ""}`;
        }
    } else {
        alignment = alignment.toUpperCase();
        switch (alignment) {
            case "L":
                return "lawful";
            case "N":
                return "neutral";
            case "NX":
                return "neutral (law/chaos axis)";
            case "NY":
                return "neutral (good/evil axis)";
            case "C":
                return "chaotic";
            case "G":
                return "good";
            case "E":
                return "evil";
            // "special" values
            case "U":
                return "unaligned";
            case "A":
                return "any alignment";
        }
        return alignment;
    }
}

function getSpeedString(it: any) {
    if (it.speed == null) return "\u2014";

    function procSpeed(propName: string) {
        function addSpeed(s: number) {
            stack.push(
                `${propName === "walk" ? "" : `${propName} `}${getVal(
                    s
                )} ft.${getCond(s)}`
            );
        }

        if (it.speed[propName] || propName === "walk")
            addSpeed(it.speed[propName] || 0);
        if (it.speed.alternate && it.speed.alternate[propName])
            it.speed.alternate[propName].forEach(addSpeed);
    }

    function getVal(speedProp: any) {
        return speedProp.number != null ? speedProp.number : speedProp;
    }

    function getCond(speedProp: any) {
        return "";
    }

    const stack = [];
    if (typeof it.speed === "object") {
        let joiner = ", ";
        procSpeed("walk");
        procSpeed("burrow");
        procSpeed("climb");
        procSpeed("fly");
        procSpeed("swim");
        if (it.speed.choose) {
            joiner = "; ";
            stack.push(
                `${it.speed.choose.from.sort().joinConjunct(", ", " or ")} ${
                    it.speed.choose.amount
                } ft.${it.speed.choose.note ? ` ${it.speed.choose.note}` : ""}`
            );
        }
        return stack.join(joiner) + (it.speed.note ? ` ${it.speed.note}` : "");
    } else {
        return it.speed + (it.speed === "Varies" ? "" : " ft. ");
    }
}
const SZ_FINE = "F";
const SZ_DIMINUTIVE = "D";
const SZ_TINY = "T";
const SZ_SMALL = "S";
const SZ_MEDIUM = "M";
const SZ_LARGE = "L";
const SZ_HUGE = "H";
const SZ_GARGANTUAN = "G";
const SZ_COLOSSAL = "C";
const SZ_VARIES = "V";

const SIZE_ABV_TO_FULL: { [abbreviation: string]: string } = {};
SIZE_ABV_TO_FULL[SZ_FINE] = "Fine";
SIZE_ABV_TO_FULL[SZ_DIMINUTIVE] = "Diminutive";
SIZE_ABV_TO_FULL[SZ_TINY] = "Tiny";
SIZE_ABV_TO_FULL[SZ_SMALL] = "Small";
SIZE_ABV_TO_FULL[SZ_MEDIUM] = "Medium";
SIZE_ABV_TO_FULL[SZ_LARGE] = "Large";
SIZE_ABV_TO_FULL[SZ_HUGE] = "Huge";
SIZE_ABV_TO_FULL[SZ_GARGANTUAN] = "Gargantuan";
SIZE_ABV_TO_FULL[SZ_COLOSSAL] = "Colossal";
SIZE_ABV_TO_FULL[SZ_VARIES] = "Varies";

const SRC_CoS = "CoS";
const SRC_DMG = "DMG";
const SRC_EEPC = "EEPC";
const SRC_EET = "EET";
const SRC_HotDQ = "HotDQ";
const SRC_LMoP = "LMoP";
const SRC_Mag = "Mag";
const SRC_MM = "MM";
const SRC_OotA = "OotA";
const SRC_PHB = "PHB";
const SRC_PotA = "PotA";
const SRC_RoT = "RoT";
const SRC_RoTOS = "RoTOS";
const SRC_SCAG = "SCAG";
const SRC_SKT = "SKT";
const SRC_ToA = "ToA";
const SRC_ToD = "ToD";
const SRC_TTP = "TTP";
const SRC_TYP = "TftYP";
const SRC_TYP_AtG = "TftYP-AtG";
const SRC_TYP_DiT = "TftYP-DiT";
const SRC_TYP_TFoF = "TftYP-TFoF";
const SRC_TYP_THSoT = "TftYP-THSoT";
const SRC_TYP_TSC = "TftYP-TSC";
const SRC_TYP_ToH = "TftYP-ToH";
const SRC_TYP_WPM = "TftYP-WPM";
const SRC_VGM = "VGM";
const SRC_XGE = "XGE";
const SRC_OGA = "OGA";
const SRC_MTF = "MTF";
const SRC_WDH = "WDH";
const SRC_WDMM = "WDMM";
const SRC_GGR = "GGR";
const SRC_KKW = "KKW";
const SRC_LLK = "LLK";
const SRC_GoS = "GoS";
const SRC_AI = "AI";
const SRC_OoW = "OoW";
const SRC_ESK = "ESK";
const SRC_DIP = "DIP";
const SRC_HftT = "HftT";
const SRC_DC = "DC";
const SRC_SLW = "SLW";
const SRC_SDW = "SDW";
const SRC_BGDIA = "BGDIA";
const SRC_LR = "LR";
const SRC_AL = "AL";
const SRC_SAC = "SAC";
const SRC_ERLW = "ERLW";
const SRC_EFR = "EFR";
const SRC_RMBRE = "RMBRE";
const SRC_RMR = "RMR";
const SRC_MFF = "MFF";
const SRC_AWM = "AWM";
const SRC_IMR = "IMR";
const SRC_SADS = "SADS";
const SRC_EGW = "EGW";
const SRC_EGW_ToR = "ToR";
const SRC_EGW_DD = "DD";
const SRC_EGW_FS = "FS";
const SRC_EGW_US = "US";
const SRC_MOT = "MOT";
const SRC_IDRotF = "IDRotF";
const SRC_TCE = "TCE";
const SRC_VRGR = "VRGR";
const SRC_HoL = "HoL";
const SRC_SCREEN = "Screen";
const SRC_SCREEN_WILDERNESS_KIT = "ScreenWildernessKit";
const SRC_HEROES_FEAST = "HF";
const SRC_CM = "CM";

const SRC_AL_PREFIX = "AL";

const SRC_ALCoS = `${SRC_AL_PREFIX}CurseOfStrahd`;
const SRC_ALEE = `${SRC_AL_PREFIX}ElementalEvil`;
const SRC_ALRoD = `${SRC_AL_PREFIX}RageOfDemons`;

const SRC_PS_PREFIX = "PS";

const SRC_PSA = `${SRC_PS_PREFIX}A`;
const SRC_PSI = `${SRC_PS_PREFIX}I`;
const SRC_PSK = `${SRC_PS_PREFIX}K`;
const SRC_PSZ = `${SRC_PS_PREFIX}Z`;
const SRC_PSX = `${SRC_PS_PREFIX}X`;
const SRC_PSD = `${SRC_PS_PREFIX}D`;

const SRC_UA_PREFIX = "UA";

const SRC_UAA = `${SRC_UA_PREFIX}Artificer`;
const SRC_UAEAG = `${SRC_UA_PREFIX}EladrinAndGith`;
const SRC_UAEBB = `${SRC_UA_PREFIX}Eberron`;
const SRC_UAFFR = `${SRC_UA_PREFIX}FeatsForRaces`;
const SRC_UAFFS = `${SRC_UA_PREFIX}FeatsForSkills`;
const SRC_UAFO = `${SRC_UA_PREFIX}FiendishOptions`;
const SRC_UAFT = `${SRC_UA_PREFIX}Feats`;
const SRC_UAGH = `${SRC_UA_PREFIX}GothicHeroes`;
const SRC_UAMDM = `${SRC_UA_PREFIX}ModernMagic`;
const SRC_UASSP = `${SRC_UA_PREFIX}StarterSpells`;
const SRC_UATMC = `${SRC_UA_PREFIX}TheMysticClass`;
const SRC_UATOBM = `${SRC_UA_PREFIX}ThatOldBlackMagic`;
const SRC_UATRR = `${SRC_UA_PREFIX}TheRangerRevised`;
const SRC_UAWA = `${SRC_UA_PREFIX}WaterborneAdventures`;
const SRC_UAVR = `${SRC_UA_PREFIX}VariantRules`;
const SRC_UALDR = `${SRC_UA_PREFIX}LightDarkUnderdark`;
const SRC_UARAR = `${SRC_UA_PREFIX}RangerAndRogue`;
const SRC_UAATOSC = `${SRC_UA_PREFIX}ATrioOfSubclasses`;
const SRC_UABPP = `${SRC_UA_PREFIX}BarbarianPrimalPaths`;
const SRC_UARSC = `${SRC_UA_PREFIX}RevisedSubclasses`;
const SRC_UAKOO = `${SRC_UA_PREFIX}KitsOfOld`;
const SRC_UABBC = `${SRC_UA_PREFIX}BardBardColleges`;
const SRC_UACDD = `${SRC_UA_PREFIX}ClericDivineDomains`;
const SRC_UAD = `${SRC_UA_PREFIX}Druid`;
const SRC_UARCO = `${SRC_UA_PREFIX}RevisedClassOptions`;
const SRC_UAF = `${SRC_UA_PREFIX}Fighter`;
const SRC_UAM = `${SRC_UA_PREFIX}Monk`;
const SRC_UAP = `${SRC_UA_PREFIX}Paladin`;
const SRC_UAMC = `${SRC_UA_PREFIX}ModifyingClasses`;
const SRC_UAS = `${SRC_UA_PREFIX}Sorcerer`;
const SRC_UAWAW = `${SRC_UA_PREFIX}WarlockAndWizard`;
const SRC_UATF = `${SRC_UA_PREFIX}TheFaithful`;
const SRC_UAWR = `${SRC_UA_PREFIX}WizardRevisited`;
const SRC_UAESR = `${SRC_UA_PREFIX}ElfSubraces`;
const SRC_UAMAC = `${SRC_UA_PREFIX}MassCombat`;
const SRC_UA3PE = `${SRC_UA_PREFIX}ThreePillarExperience`;
const SRC_UAGHI = `${SRC_UA_PREFIX}GreyhawkInitiative`;
const SRC_UATSC = `${SRC_UA_PREFIX}ThreeSubclasses`;
const SRC_UAOD = `${SRC_UA_PREFIX}OrderDomain`;
const SRC_UACAM = `${SRC_UA_PREFIX}CentaursMinotaurs`;
const SRC_UAGSS = `${SRC_UA_PREFIX}GiantSoulSorcerer`;
const SRC_UARoE = `${SRC_UA_PREFIX}RacesOfEberron`;
const SRC_UARoR = `${SRC_UA_PREFIX}RacesOfRavnica`;
const SRC_UAWGE = `${SRC_UA_PREFIX}WGE`;
const SRC_UAOSS = `${SRC_UA_PREFIX}OfShipsAndSea`;
const SRC_UASIK = `${SRC_UA_PREFIX}Sidekicks`;
const SRC_UAAR = `${SRC_UA_PREFIX}ArtificerRevisited`;
const SRC_UABAM = `${SRC_UA_PREFIX}BarbarianAndMonk`;
const SRC_UASAW = `${SRC_UA_PREFIX}SorcererAndWarlock`;
const SRC_UABAP = `${SRC_UA_PREFIX}BardAndPaladin`;
const SRC_UACDW = `${SRC_UA_PREFIX}ClericDruidWizard`;
const SRC_UAFRR = `${SRC_UA_PREFIX}FighterRangerRogue`;
const SRC_UACFV = `${SRC_UA_PREFIX}ClassFeatureVariants`;
const SRC_UAFRW = `${SRC_UA_PREFIX}FighterRogueWizard`;
const SRC_UAPCRM = `${SRC_UA_PREFIX}PrestigeClassesRunMagic`;
const SRC_UAR = `${SRC_UA_PREFIX}Ranger`;
const SRC_UA2020SC1 = `${SRC_UA_PREFIX}2020SubclassesPt1`;
const SRC_UA2020SC2 = `${SRC_UA_PREFIX}2020SubclassesPt2`;
const SRC_UA2020SC3 = `${SRC_UA_PREFIX}2020SubclassesPt3`;
const SRC_UA2020SC4 = `${SRC_UA_PREFIX}2020SubclassesPt4`;
const SRC_UA2020SC5 = `${SRC_UA_PREFIX}2020SubclassesPt5`;
const SRC_UA2020SMT = `${SRC_UA_PREFIX}2020SpellsAndMagicTattoos`;
const SRC_UA2020POR = `${SRC_UA_PREFIX}2020PsionicOptionsRevisited`;
const SRC_UA2020SCR = `${SRC_UA_PREFIX}2020SubclassesRevisited`;
const SRC_UA2020F = `${SRC_UA_PREFIX}2020Feats`;
const SRC_UA2021GL = `${SRC_UA_PREFIX}2021GothicLineages`;
const SRC_UA2021FF = `${SRC_UA_PREFIX}2021FolkOfTheFeywild`;
const SRC_UA2021DO = `${SRC_UA_PREFIX}2021DraconicOptions`;
const SRC_UA2021MoS = `${SRC_UA_PREFIX}2021MagesOfStrixhaven`;

const AL_PREFIX = "Adventurers League: ";
const PS_PREFIX = "Plane Shift: ";
const UA_PREFIX = "Unearthed Arcana: ";
const TftYP_NAME = "Tales from the Yawning Portal";

const SOURCE_JSON_TO_FULL: { [abbreviation: string]: string } = {};
SOURCE_JSON_TO_FULL[SRC_CoS] = "Curse of Strahd";
SOURCE_JSON_TO_FULL[SRC_DMG] = "Dungeon Master's Guide";
SOURCE_JSON_TO_FULL[SRC_EEPC] = "Elemental Evil Player's Companion";
SOURCE_JSON_TO_FULL[SRC_EET] = "Elemental Evil: Trinkets";
SOURCE_JSON_TO_FULL[SRC_HotDQ] = "Hoard of the Dragon Queen";
SOURCE_JSON_TO_FULL[SRC_LMoP] = "Lost Mine of Phandelver";
SOURCE_JSON_TO_FULL[SRC_Mag] = "Dragon Magazine";
SOURCE_JSON_TO_FULL[SRC_MM] = "Monster Manual";
SOURCE_JSON_TO_FULL[SRC_OotA] = "Out of the Abyss";
SOURCE_JSON_TO_FULL[SRC_PHB] = "Player's Handbook";
SOURCE_JSON_TO_FULL[SRC_PotA] = "Princes of the Apocalypse";
SOURCE_JSON_TO_FULL[SRC_RoT] = "The Rise of Tiamat";
SOURCE_JSON_TO_FULL[SRC_RoTOS] = "The Rise of Tiamat Online Supplement";
SOURCE_JSON_TO_FULL[SRC_SCAG] = "Sword Coast Adventurer's Guide";
SOURCE_JSON_TO_FULL[SRC_SKT] = "Storm King's Thunder";
SOURCE_JSON_TO_FULL[SRC_ToA] = "Tomb of Annihilation";
SOURCE_JSON_TO_FULL[SRC_ToD] = "Tyranny of Dragons";
SOURCE_JSON_TO_FULL[SRC_TTP] = "The Tortle Package";
SOURCE_JSON_TO_FULL[SRC_TYP] = TftYP_NAME;
SOURCE_JSON_TO_FULL[SRC_TYP_AtG] = `${TftYP_NAME}: Against the Giants`;
SOURCE_JSON_TO_FULL[SRC_TYP_DiT] = `${TftYP_NAME}: Dead in Thay`;
SOURCE_JSON_TO_FULL[SRC_TYP_TFoF] = `${TftYP_NAME}: The Forge of Fury`;
SOURCE_JSON_TO_FULL[
    SRC_TYP_THSoT
] = `${TftYP_NAME}: The Hidden Shrine of Tamoachan`;
SOURCE_JSON_TO_FULL[SRC_TYP_TSC] = `${TftYP_NAME}: The Sunless Citadel`;
SOURCE_JSON_TO_FULL[SRC_TYP_ToH] = `${TftYP_NAME}: Tomb of Horrors`;
SOURCE_JSON_TO_FULL[SRC_TYP_WPM] = `${TftYP_NAME}: White Plume Mountain`;
SOURCE_JSON_TO_FULL[SRC_VGM] = "Volo's Guide to Monsters";
SOURCE_JSON_TO_FULL[SRC_XGE] = "Xanathar's Guide to Everything";
SOURCE_JSON_TO_FULL[SRC_OGA] = "One Grung Above";
SOURCE_JSON_TO_FULL[SRC_MTF] = "Mordenkainen's Tome of Foes";
SOURCE_JSON_TO_FULL[SRC_WDH] = "Waterdeep: Dragon Heist";
SOURCE_JSON_TO_FULL[SRC_WDMM] = "Waterdeep: Dungeon of the Mad Mage";
SOURCE_JSON_TO_FULL[SRC_GGR] = "Guildmasters' Guide to Ravnica";
SOURCE_JSON_TO_FULL[SRC_KKW] = "Krenko's Way";
SOURCE_JSON_TO_FULL[SRC_LLK] = "Lost Laboratory of Kwalish";
SOURCE_JSON_TO_FULL[SRC_GoS] = "Ghosts of Saltmarsh";
SOURCE_JSON_TO_FULL[SRC_AI] = "Acquisitions Incorporated";
SOURCE_JSON_TO_FULL[SRC_OoW] = "The Orrery of the Wanderer";
SOURCE_JSON_TO_FULL[SRC_ESK] = "Essentials Kit";
SOURCE_JSON_TO_FULL[SRC_DIP] = "Dragon of Icespire Peak";
SOURCE_JSON_TO_FULL[SRC_HftT] = "Hunt for the Thessalhydra";
SOURCE_JSON_TO_FULL[SRC_DC] = "Divine Contention";
SOURCE_JSON_TO_FULL[SRC_SLW] = "Storm Lord's Wrath";
SOURCE_JSON_TO_FULL[SRC_SDW] = "Sleeping Dragon's Wake";
SOURCE_JSON_TO_FULL[SRC_BGDIA] = "Baldur's Gate: Descent Into Avernus";
SOURCE_JSON_TO_FULL[SRC_LR] = "Locathah Rising";
SOURCE_JSON_TO_FULL[SRC_AL] = "Adventurers' League";
SOURCE_JSON_TO_FULL[SRC_SAC] = "Sage Advice Compendium";
SOURCE_JSON_TO_FULL[SRC_ERLW] = "Eberron: Rising from the Last War";
SOURCE_JSON_TO_FULL[SRC_EFR] = "Eberron: Forgotten Relics";
SOURCE_JSON_TO_FULL[SRC_RMBRE] =
    "The Lost Dungeon of Rickedness: Big Rick Energy";
SOURCE_JSON_TO_FULL[SRC_RMR] =
    "Dungeons & Dragons vs. Rick and Morty: Basic Rules";
SOURCE_JSON_TO_FULL[SRC_MFF] = "Mordenkainen's Fiendish Folio";
SOURCE_JSON_TO_FULL[SRC_AWM] = "Adventure with Muk";
SOURCE_JSON_TO_FULL[SRC_IMR] = "Infernal Machine Rebuild";
SOURCE_JSON_TO_FULL[SRC_SADS] = "Sapphire Anniversary Dice Set";
SOURCE_JSON_TO_FULL[SRC_EGW] = "Explorer's Guide to Wildemount";
SOURCE_JSON_TO_FULL[SRC_EGW_ToR] = "Tide of Retribution";
SOURCE_JSON_TO_FULL[SRC_EGW_DD] = "Dangerous Designs";
SOURCE_JSON_TO_FULL[SRC_EGW_FS] = "Frozen Sick";
SOURCE_JSON_TO_FULL[SRC_EGW_US] = "Unwelcome Spirits";
SOURCE_JSON_TO_FULL[SRC_MOT] = "Mythic Odysseys of Theros";
SOURCE_JSON_TO_FULL[SRC_IDRotF] = "Icewind Dale: Rime of the Frostmaiden";
SOURCE_JSON_TO_FULL[SRC_TCE] = "Tasha's Cauldron of Everything";
SOURCE_JSON_TO_FULL[SRC_VRGR] = "Van Richten's Guide to Ravenloft";
SOURCE_JSON_TO_FULL[SRC_HoL] = "The House of Lament";
SOURCE_JSON_TO_FULL[SRC_SCREEN] = "Dungeon Master's Screen";
SOURCE_JSON_TO_FULL[SRC_SCREEN_WILDERNESS_KIT] =
    "Dungeon Master's Screen: Wilderness Kit";
SOURCE_JSON_TO_FULL[SRC_HEROES_FEAST] = "Heroes' Feast";
SOURCE_JSON_TO_FULL[SRC_CM] = "Candlekeep Mysteries";
SOURCE_JSON_TO_FULL[SRC_ALCoS] = `${AL_PREFIX}Curse of Strahd`;
SOURCE_JSON_TO_FULL[SRC_ALEE] = `${AL_PREFIX}Elemental Evil`;
SOURCE_JSON_TO_FULL[SRC_ALRoD] = `${AL_PREFIX}Rage of Demons`;
SOURCE_JSON_TO_FULL[SRC_PSA] = `${PS_PREFIX}Amonkhet`;
SOURCE_JSON_TO_FULL[SRC_PSI] = `${PS_PREFIX}Innistrad`;
SOURCE_JSON_TO_FULL[SRC_PSK] = `${PS_PREFIX}Kaladesh`;
SOURCE_JSON_TO_FULL[SRC_PSZ] = `${PS_PREFIX}Zendikar`;
SOURCE_JSON_TO_FULL[SRC_PSX] = `${PS_PREFIX}Ixalan`;
SOURCE_JSON_TO_FULL[SRC_PSD] = `${PS_PREFIX}Dominaria`;
SOURCE_JSON_TO_FULL[SRC_UAA] = `${UA_PREFIX}Artificer`;
SOURCE_JSON_TO_FULL[SRC_UAEAG] = `${UA_PREFIX}Eladrin and Gith`;
SOURCE_JSON_TO_FULL[SRC_UAEBB] = `${UA_PREFIX}Eberron`;
SOURCE_JSON_TO_FULL[SRC_UAFFR] = `${UA_PREFIX}Feats for Races`;
SOURCE_JSON_TO_FULL[SRC_UAFFS] = `${UA_PREFIX}Feats for Skills`;
SOURCE_JSON_TO_FULL[SRC_UAFO] = `${UA_PREFIX}Fiendish Options`;
SOURCE_JSON_TO_FULL[SRC_UAFT] = `${UA_PREFIX}Feats`;
SOURCE_JSON_TO_FULL[SRC_UAGH] = `${UA_PREFIX}Gothic Heroes`;
SOURCE_JSON_TO_FULL[SRC_UAMDM] = `${UA_PREFIX}Modern Magic`;
SOURCE_JSON_TO_FULL[SRC_UASSP] = `${UA_PREFIX}Starter Spells`;
SOURCE_JSON_TO_FULL[SRC_UATMC] = `${UA_PREFIX}The Mystic Class`;
SOURCE_JSON_TO_FULL[SRC_UATOBM] = `${UA_PREFIX}That Old Black Magic`;
SOURCE_JSON_TO_FULL[SRC_UATRR] = `${UA_PREFIX}The Ranger, Revised`;
SOURCE_JSON_TO_FULL[SRC_UAWA] = `${UA_PREFIX}Waterborne Adventures`;
SOURCE_JSON_TO_FULL[SRC_UAVR] = `${UA_PREFIX}Variant Rules`;
SOURCE_JSON_TO_FULL[SRC_UALDR] = `${UA_PREFIX}Light, Dark, Underdark!`;
SOURCE_JSON_TO_FULL[SRC_UARAR] = `${UA_PREFIX}Ranger and Rogue`;
SOURCE_JSON_TO_FULL[SRC_UAATOSC] = `${UA_PREFIX}A Trio of Subclasses`;
SOURCE_JSON_TO_FULL[SRC_UABPP] = `${UA_PREFIX}Barbarian Primal Paths`;
SOURCE_JSON_TO_FULL[SRC_UARSC] = `${UA_PREFIX}Revised Subclasses`;
SOURCE_JSON_TO_FULL[SRC_UAKOO] = `${UA_PREFIX}Kits of Old`;
SOURCE_JSON_TO_FULL[SRC_UABBC] = `${UA_PREFIX}Bard: Bard Colleges`;
SOURCE_JSON_TO_FULL[SRC_UACDD] = `${UA_PREFIX}Cleric: Divine Domains`;
SOURCE_JSON_TO_FULL[SRC_UAD] = `${UA_PREFIX}Druid`;
SOURCE_JSON_TO_FULL[SRC_UARCO] = `${UA_PREFIX}Revised Class Options`;
SOURCE_JSON_TO_FULL[SRC_UAF] = `${UA_PREFIX}Fighter`;
SOURCE_JSON_TO_FULL[SRC_UAM] = `${UA_PREFIX}Monk`;
SOURCE_JSON_TO_FULL[SRC_UAP] = `${UA_PREFIX}Paladin`;
SOURCE_JSON_TO_FULL[SRC_UAMC] = `${UA_PREFIX}Modifying Classes`;
SOURCE_JSON_TO_FULL[SRC_UAS] = `${UA_PREFIX}Sorcerer`;
SOURCE_JSON_TO_FULL[SRC_UAWAW] = `${UA_PREFIX}Warlock and Wizard`;
SOURCE_JSON_TO_FULL[SRC_UATF] = `${UA_PREFIX}The Faithful`;
SOURCE_JSON_TO_FULL[SRC_UAWR] = `${UA_PREFIX}Wizard Revisited`;
SOURCE_JSON_TO_FULL[SRC_UAESR] = `${UA_PREFIX}Elf Subraces`;
SOURCE_JSON_TO_FULL[SRC_UAMAC] = `${UA_PREFIX}Mass Combat`;
SOURCE_JSON_TO_FULL[SRC_UA3PE] = `${UA_PREFIX}Three-Pillar Experience`;
SOURCE_JSON_TO_FULL[SRC_UAGHI] = `${UA_PREFIX}Greyhawk Initiative`;
SOURCE_JSON_TO_FULL[SRC_UATSC] = `${UA_PREFIX}Three Subclasses`;
SOURCE_JSON_TO_FULL[SRC_UAOD] = `${UA_PREFIX}Order Domain`;
SOURCE_JSON_TO_FULL[SRC_UACAM] = `${UA_PREFIX}Centaurs and Minotaurs`;
SOURCE_JSON_TO_FULL[SRC_UAGSS] = `${UA_PREFIX}Giant Soul Sorcerer`;
SOURCE_JSON_TO_FULL[SRC_UARoE] = `${UA_PREFIX}Races of Eberron`;
SOURCE_JSON_TO_FULL[SRC_UARoR] = `${UA_PREFIX}Races of Ravnica`;
SOURCE_JSON_TO_FULL[SRC_UAWGE] = "Wayfinder's Guide to Eberron";
SOURCE_JSON_TO_FULL[SRC_UAOSS] = `${UA_PREFIX}Of Ships and the Sea`;
SOURCE_JSON_TO_FULL[SRC_UASIK] = `${UA_PREFIX}Sidekicks`;
SOURCE_JSON_TO_FULL[SRC_UAAR] = `${UA_PREFIX}Artificer Revisited`;
SOURCE_JSON_TO_FULL[SRC_UABAM] = `${UA_PREFIX}Barbarian and Monk`;
SOURCE_JSON_TO_FULL[SRC_UASAW] = `${UA_PREFIX}Sorcerer and Warlock`;
SOURCE_JSON_TO_FULL[SRC_UABAP] = `${UA_PREFIX}Bard and Paladin`;
SOURCE_JSON_TO_FULL[SRC_UACDW] = `${UA_PREFIX}Cleric, Druid, and Wizard`;
SOURCE_JSON_TO_FULL[SRC_UAFRR] = `${UA_PREFIX}Fighter, Ranger, and Rogue`;
SOURCE_JSON_TO_FULL[SRC_UACFV] = `${UA_PREFIX}Class Feature Variants`;
SOURCE_JSON_TO_FULL[SRC_UAFRW] = `${UA_PREFIX}Fighter, Rogue, and Wizard`;
SOURCE_JSON_TO_FULL[SRC_UAPCRM] = `${UA_PREFIX}Prestige Classes and Rune Magic`;
SOURCE_JSON_TO_FULL[SRC_UAR] = `${UA_PREFIX}Ranger`;
SOURCE_JSON_TO_FULL[SRC_UA2020SC1] = `${UA_PREFIX}2020 Subclasses, Part 1`;
SOURCE_JSON_TO_FULL[SRC_UA2020SC2] = `${UA_PREFIX}2020 Subclasses, Part 2`;
SOURCE_JSON_TO_FULL[SRC_UA2020SC3] = `${UA_PREFIX}2020 Subclasses, Part 3`;
SOURCE_JSON_TO_FULL[SRC_UA2020SC4] = `${UA_PREFIX}2020 Subclasses, Part 4`;
SOURCE_JSON_TO_FULL[SRC_UA2020SC5] = `${UA_PREFIX}2020 Subclasses, Part 5`;
SOURCE_JSON_TO_FULL[
    SRC_UA2020SMT
] = `${UA_PREFIX}2020 Spells and Magic Tattoos`;
SOURCE_JSON_TO_FULL[
    SRC_UA2020POR
] = `${UA_PREFIX}2020 Psionic Options Revisited`;
SOURCE_JSON_TO_FULL[SRC_UA2020SCR] = `${UA_PREFIX}2020 Subclasses Revisited`;
SOURCE_JSON_TO_FULL[SRC_UA2020F] = `${UA_PREFIX}2020 Feats`;
SOURCE_JSON_TO_FULL[SRC_UA2021GL] = `${UA_PREFIX}2021 Gothic Lineages`;
SOURCE_JSON_TO_FULL[SRC_UA2021FF] = `${UA_PREFIX}2021 Folk of the Feywild`;
SOURCE_JSON_TO_FULL[SRC_UA2021DO] = `${UA_PREFIX}2021 Draconic Options`;
SOURCE_JSON_TO_FULL[SRC_UA2021MoS] = `${UA_PREFIX}2021 Mages of Strixhaven`;
