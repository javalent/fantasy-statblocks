//@ts-nocheck
import { nanoid } from "src/util/util";
import type { DefaultLayout, Layout } from "../layout.types";

export const LayoutPF2e: DefaultLayout = {
    blocks: [
        {
            type: "inline",
            id: "e9b8483aeafa",
            properties: [],
            nested: [
                {
                    type: "property",
                    id: "2b596a6919fb",
                    properties: ["name"],
                    fallback: "-",
                    markdown: true,
                    dice: false,
                    conditioned: true,
                    display: " "
                },
                {
                    type: "property",
                    id: "98389a48f808",
                    properties: ["level"],
                    fallback: "-",
                    display: " ",
                    conditioned: true,
                    markdown: true,
                    dice: false
                }
            ],
            hasRule: true
        },
        {
            type: "group",
            id: "4b3a6809a938",
            properties: [],
            nested: [
                {
                    type: "inline",
                    id: "289a4b787968",
                    properties: [],
                    nested: [
                        {
                            type: "property",
                            id: "694a3888b859",
                            properties: ["rare_01"],
                            fallback: "-",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "590a88988ae8",
                            properties: ["rare_02"],
                            fallback: "-",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "9a9be808699a",
                            properties: ["rare_03"],
                            fallback: "-",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "2988db1a685a",
                            properties: ["rare_04"],
                            fallback: "-",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "ba891ba8cbeb",
                            properties: ["alignment"],
                            fallback: " ",
                            display: " ",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "ebf9883938a8",
                            properties: ["size"],
                            fallback: " ",
                            display: " ",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "dabaf9e9fb68",
                            properties: ["trait_01"],
                            fallback: " ",
                            display: " ",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "e81a6aeadbf9",
                            properties: ["trait_02"],
                            fallback: " ",
                            display: " ",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "fa7919caabbb",
                            properties: ["trait_03"],
                            fallback: "-",
                            conditioned: true,
                            display: " ",
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "58c9c8580b68",
                            properties: ["trait_04"],
                            fallback: "-",
                            conditioned: true,
                            display: " ",
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "da894a7b8849",
                            properties: ["trait_05"],
                            fallback: "-",
                            display: " ",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "fb6b4b6bab49",
                            properties: ["trait_06"],
                            fallback: "-",
                            display: " ",
                            conditioned: true,
                            markdown: true
                        },
                        {
                            type: "property",
                            id: "480a5bfafb88",
                            properties: ["trait_07"],
                            fallback: "-",
                            display: " ",
                            conditioned: true,
                            markdown: true
                        }
                    ],
                    hasRule: true,
                    conditioned: true
                }
            ]
        },
        {
            type: "group",
            id: "5999ea79ca3b",
            properties: [],
            nested: [
                {
                    type: "traits",
                    id: "9a9af9fbe959",
                    properties: ["perception"],
                    fallback: "-",
                    heading: " ",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    headingProp: true
                },
                {
                    type: "property",
                    id: "ba28f9384918",
                    properties: ["languages"],
                    fallback: "-",
                    display: "Language",
                    conditioned: true,
                    markdown: true
                },
                {
                    type: "traits",
                    id: "a8f8187b89fb",
                    properties: ["skills"],
                    fallback: "-",
                    markdown: true,
                    dice: true,
                    conditioned: true,
                    heading: " "
                },
                {
                    type: "table",
                    id: "b82b0a1a9969",
                    properties: ["abilityMods"],
                    headers: ["Str", "Dex", "Con", "Int", "Wis", "Cha"],
                    calculate: false,
                    fallback: "-",
                    conditioned: true,
                    dice: true
                },
                {
                    type: "traits",
                    id: "e96ba9d8a80a",
                    properties: ["abilities_top"],
                    fallback: "-",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    heading: "  ",
                    hasRule: false
                }
            ],
            hasRule: true
        },
        {
            type: "group",
            id: "faaa08993a98",
            properties: [],
            nested: [
                {
                    type: "traits",
                    id: "68ca69891bea",
                    properties: ["armorclass"],
                    fallback: "-",
                    heading: "",
                    conditioned: true,
                    dice: true,
                    markdown: true
                },
                {
                    type: "traits",
                    id: "9b1998e9a8da",
                    properties: ["health"],
                    fallback: "-",
                    heading: "",
                    conditioned: true,
                    dice: true,
                    markdown: true
                },
                {
                    type: "traits",
                    id: "ca2bf968987b",
                    properties: ["abilities_mid"],
                    fallback: "-",
                    heading: "",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    hasRule: false
                }
            ],
            hasRule: true
        },
        {
            type: "group",
            id: "cbeabaf93b58",
            properties: [],
            nested: [
                {
                    type: "property",
                    id: "0b4809ba0b29",
                    properties: ["speed"],
                    fallback: "-",
                    display: "Speed",
                    conditioned: true,
                    markdown: true,
                    dice: false
                },
                {
                    type: "traits",
                    id: "882bc9aa0898",
                    properties: ["attacks"],
                    fallback: "-",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    headingProp: false,
                    heading: ""
                },
                {
                    type: "traits",
                    id: "6919b8996939",
                    properties: ["spellcasting"],
                    fallback: "-",
                    heading: " ",
                    markdown: true,
                    dice: true,
                    conditioned: true
                },
                {
                    type: "traits",
                    id: "aacb399a3b58",
                    properties: ["abilities_bot"],
                    fallback: "-",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    hasRule: false
                }
            ],
            hasRule: true
        },
        {
            type: "text",
            id: "1b195a894b58",
            properties: ["token"],
            text: null,
            fallback: "",
            heading: "Show to Players",
            conditioned: true,
            markdown: true
        },
        {
            type: "image",
            id: "1bba89582b29",
            properties: ["token"],
            fallback: "",
            conditioned: true,
            hasRule: true
        },
        {
            type: "property",
            id: "88e97a485b79",
            properties: ["sourcebook"],
            fallback: "-",
            conditioned: true,
            markdown: true,
            dice: false,
            display: " Source:"
        }
    ],
    name: "Basic Pathfinder 2e Layout",
    id: "path-2e-block",
    version: 2,
    diceParsing: [
        {
            regex: /\((\d+d\d+(?:\s*[+-]\s*\d+)?)\)/.source,
            parser: 'const [, text] = matches;\nreturn ["(", { text }, ")"];',
            id: nanoid(),
            desc: "(1d8+3)"
        },
        {
            regex: /(\w+?) ([+-])(\d+)/.source,
            parser: 'let [, initial, sign, number] = matches;\nlet mult = 1;\nif (sign === "-") {\n    mult = -1;\n}\nlet text;\nif (!isNaN(Number(number))) {\n    text = `1d20+${mult * Number(number)}`;\n}\nreturn [original, " (", { text }, ")"];',
            id: nanoid(),
            desc: "longsword +15"
        }
    ]
};

export const LayoutPF2eCreature: DefaultLayout = {
    blocks: [
        {
            type: "inline",
            id: "e9b8483aeafa",
            properties: [],
            nested: [
                {
                    type: "property",
                    id: "2b596a6919fb",
                    properties: [
                        "name"
                    ],
                    fallback: "-",
                    markdown: true,
                    dice: false,
                    conditioned: true,
                    display: " "
                },
                {
                    type: "inline",
                    id: "499aea6a9aca",
                    properties: [],
                    nested: [
                        {
                            type: "action",
                            id: "8a6a7a499b78",
                            icon: "sword",
                            callback: "try { InitiativeTracker.newEncounter({roll: true, creatures: [monster]}); } catch(e) {}"
                        },
                        {
                            type: "action",
                            id: "fbea380b09b9",
                            icon: "plus-with-circle",
                            callback: "try { InitiativeTracker.addCreatures([monster]); } catch(e) {}"
                        }
                    ]
                },
                {
                    type: "property",
                    id: "98389a48f808",
                    properties: [
                        "level"
                    ],
                    fallback: "-",
                    display: " ",
                    conditioned: true,
                    markdown: true,
                    dice: false
                }
            ],
            hasRule: true
        },
        {
            type: "group",
            id: "4b3a6809a938",
            properties: [],
            nested: [
                {
                    type: "property",
                    id: "0979a989583a",
                    properties: [
                        "traits"
                    ],
                    fallback: "-",
                    callback: "if (!monster.traits) return \"\";\nvar s = \"\"\nif (monster.rarity) {\n  s += `- <span class=\"rarity ${monster.rarity.toLowerCase()}\">${monster.rarity}</span>\\n`\n}\nif (monster.alignment) {\n  s += `- <span class=alignment>${monster.alignment}</span>\\n`\n}\nif (monster.size) {\n  s += `- <span class=size>${monster.size}</span>\\n`\n}\nfor (const text of monster.traits) {\n  s += `- ${text}\\n`\n}\nreturn s;",
                    conditioned: true,
                    display: ""
                }
            ],
            hasRule: true,
            cls: "pf2e-traits"
        },
        {
            type: "group",
            id: "5999ea79ca3b",
            properties: [],
            nested: [
                {
                    type: "inline",
                    id: "881859197838",
                    properties: [],
                    nested: [
                        {
                            type: "property",
                            id: "4ad9f92ab8f8",
                            properties: [
                                "modifier"
                            ],
                            fallback: "-",
                            display: "Perception",
                            conditioned: false,
                            dice: false,
                            diceCallback: "return [\"+\" + property, \" (\", { text: \"1d20+\" + property }, \")\"]"
                        },
                        {
                            type: "property",
                            id: "8bd82998dadb",
                            properties: [
                                "senses"
                            ],
                            fallback: "-",
                            conditioned: true,
                            display: ""
                        }
                    ],
                    cls: "oneline",
                    conditioned: true
                },
                {
                    type: "property",
                    id: "ba28f9384918",
                    properties: [
                        "languages"
                    ],
                    fallback: "-",
                    display: "Language",
                    conditioned: true,
                    markdown: true
                },
                {
                    type: "inline",
                    id: "db1a38ebcb6b",
                    properties: [],
                    nested: [
                        {
                            type: "saves",
                            id: "6a2b78099b0b",
                            properties: [
                                "skills"
                            ],
                            fallback: "-",
                            display: "Skills",
                            conditioned: true,
                            dice: true
                        },
                        {
                            type: "property",
                            id: "2b987aead8ab",
                            properties: [
                                "skillsNote"
                            ],
                            fallback: "-",
                            conditioned: true,
                            display: ""
                        }
                    ],
                    heading: "",
                    cls: "oneline",
                    conditioned: true
                },
                {
                    type: "table",
                    id: "b82b0a1a9969",
                    properties: [
                        "abilityMods"
                    ],
                    headers: [
                        "Str",
                        "Dex",
                        "Con",
                        "Int",
                        "Wis",
                        "Cha"
                    ],
                    calculate: false,
                    fallback: "-",
                    conditioned: true,
                    dice: false
                },
                {
                    type: "property",
                    id: "1b6a98ba4888",
                    properties: [
                        "items"
                    ],
                    fallback: "-",
                    display: "Items",
                    conditioned: true
                },
                {
                    type: "traits",
                    id: "e96ba9d8a80a",
                    properties: [
                        "abilities_top"
                    ],
                    fallback: "-",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    heading: "  ",
                    hasRule: false
                }
            ],
            hasRule: true
        },
        {
            type: "group",
            id: "faaa08993a98",
            properties: [],
            nested: [
                {
                    type: "inline",
                    id: "3a5ab84a2b89",
                    properties: [],
                    nested: [
                        {
                            type: "inline",
                            id: "cb6a7809aa2b",
                            properties: [],
                            nested: [
                                {
                                    type: "property",
                                    id: "6b0b0bda0a7a",
                                    properties: [
                                        "ac"
                                    ],
                                    fallback: "-",
                                    display: "AC"
                                },
                                {
                                    type: "property",
                                    id: "0908aaab3b1b",
                                    properties: [
                                        "acNote"
                                    ],
                                    fallback: "-",
                                    conditioned: true,
                                    display: ""
                                }
                            ],
                            cls: "withnote",
                            conditioned: true
                        },
                        {
                            type: "saves",
                            id: "9999386a58ea",
                            properties: [
                                "saves"
                            ],
                            fallback: "-",
                            dice: true,
                            display: "",
                            conditioned: true
                        },
                        {
                            type: "property",
                            id: "69aa5a7b196a",
                            properties: [
                                "savesNote"
                            ],
                            fallback: "-",
                            display: "",
                            conditioned: true
                        }
                    ],
                    cls: "oneline",
                    conditioned: true
                },
                {
                    type: "inline",
                    id: "ea29d9ea5aa8",
                    properties: [],
                    nested: [
                        {
                            type: "inline",
                            id: "39584be95ae9",
                            properties: [],
                            nested: [
                                {
                                    type: "property",
                                    id: "bb6989092939",
                                    properties: [
                                        "hp"
                                    ],
                                    fallback: "-",
                                    display: "HP"
                                },
                                {
                                    type: "property",
                                    id: "b9fa1a89c8d9",
                                    properties: [
                                        "hpNote"
                                    ],
                                    fallback: "-",
                                    doNotAddClass: false,
                                    conditioned: true,
                                    display: ""
                                }
                            ],
                            cls: "withnote",
                            conditioned: true
                        },
                        {
                            type: "property",
                            id: "4bbaa9380a9b",
                            properties: [
                                "hardness"
                            ],
                            fallback: "-",
                            display: "Hardness",
                            conditioned: true
                        },
                        {
                            type: "property",
                            id: "0a8ac8d96bba",
                            properties: [
                                "immunities"
                            ],
                            fallback: "-",
                            conditioned: true,
                            display: "Immunities"
                        },
                        {
                            type: "property",
                            id: "8b7a3b89fa59",
                            properties: [
                                "resistances"
                            ],
                            fallback: "-",
                            conditioned: true,
                            display: "Resistances"
                        },
                        {
                            type: "property",
                            id: "78689b6b6b79",
                            properties: [
                                "weaknesses"
                            ],
                            fallback: "-",
                            conditioned: true,
                            display: "Weaknesses"
                        }
                    ],
                    cls: "oneline",
                    conditioned: true
                },
                {
                    type: "traits",
                    id: "ca2bf968987b",
                    properties: [
                        "abilities_mid"
                    ],
                    fallback: "-",
                    heading: "",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    hasRule: false
                }
            ],
            hasRule: true
        },
        {
            type: "group",
            id: "cbeabaf93b58",
            properties: [],
            nested: [
                {
                    type: "property",
                    id: "0b4809ba0b29",
                    properties: [
                        "speed"
                    ],
                    fallback: "-",
                    display: "Speed",
                    conditioned: true,
                    markdown: true,
                    dice: false
                },
                {
                    type: "traits",
                    id: "882bc9aa0898",
                    properties: [
                        "attacks"
                    ],
                    fallback: "-",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    headingProp: false,
                    heading: "",
                    callback: "var s = property.bonus < 0 ? \"-\" : \"+\";\ns += Math.abs(property.bonus);\nif (property.desc) {\n  s += \" \" + property.desc\n}\nif (property.damage) {\n  s += \", __Damage__ \" + property.damage\n}\nreturn s"
                },
                {
                    type: "traits",
                    id: "faeafb7b6b1b",
                    properties: [
                        "spellcasting"
                    ],
                    fallback: "-",
                    conditioned: true,
                    dice: true
                },
                {
                    type: "traits",
                    id: "aacb399a3b58",
                    properties: [
                        "abilities_bot"
                    ],
                    fallback: "-",
                    conditioned: true,
                    dice: true,
                    markdown: true,
                    hasRule: false
                }
            ],
            hasRule: true
        },
        {
            type: "text",
            id: "1b195a894b58",
            properties: [
                "token"
            ],
            text: null,
            fallback: "",
            heading: "Show to Players",
            conditioned: true,
            markdown: true
        },
        {
            type: "image",
            id: "1bba89582b29",
            properties: [
                "token"
            ],
            fallback: "",
            conditioned: true,
            hasRule: true
        },
        {
            type: "property",
            id: "88e97a485b79",
            properties: [
                "sourcebook"
            ],
            fallback: "-",
            conditioned: true,
            markdown: true,
            dice: false,
            display: " Source:"
        }
    ],
    name: "Pathfinder 2e Creature Layout",
    id: "b8ab3ae89a0a",
    diceParsing: [
        {
            regex: "(\\s|^)(\\d+d\\d+(?:\\s*[+-]\\s*\\d+)?)(\\W|$)",
            parser: "const [, before, text, after] = matches;\nreturn [before + text, \" (\", { text }, \")\", after];",
            id: "4a79397b896a",
            desc: "1d6+10"
        },
        {
            regex: "(^|\\s)([+-]\\d+)(\\W|$)(?!status|bonus)",
            parser: "let [, before, bonus, after] = matches;\nreturn [\n  before + bonus,\n  \" (\", { text: \"1d20\" + bonus }, \")\",\n  after\n];",
            id: "8bb8fbbb0869",
            desc: "+15"
        }
    ]
}