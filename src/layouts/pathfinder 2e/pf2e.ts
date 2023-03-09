//@ts-nocheck
import { nanoid } from "src/util/util";
import type { DefaultLayout, Layout, StatblockItem } from "../types";
export const StatblockPF2e: StatblockItem[] = [
    {
        type: "inline",
        id: nanoid(),
        properties: [],
        hasRule: true,
        nested: [
            {
                type: "group",
                id: nanoid(),
                properties: [
                    "name",
                    "description",
                    "aspects",
                    "temporaryAspects"
                ],
                nested: [
                    {
                        type: "heading",
                        id: nanoid(),
                        properties: ["name"],
                        conditioned: true,
                        size: 1
                    },
                    {
                        type: "text",
                        id: nanoid(),
                        properties: ["description"],
                        conditioned: true,
                        markdown: true,
                        text: null,
                        dice: false
                    },
                    {
                        type: "text",
                        id: nanoid(),
                        properties: ["aspects"],
                        markdown: true,
                        text: null,
                        dice: false,
                        conditioned: true,
                        heading: "Aspects"
                    },
                    {
                        type: "text",
                        id: nanoid(),
                        properties: ["temporaryAspects"],
                        markdown: true,
                        text: null,
                        dice: false,
                        conditioned: true,
                        heading: "Temporary Aspects"
                    }
                ],
                conditioned: true
            },
            {
                type: "image",
                id: nanoid(),
                properties: ["image"],
                conditioned: true
            }
        ]
    },
    {
        type: "table",
        id: nanoid(),
        properties: ["stress"],
        headers: ["Physical", "Mental"],
        calculate: false,
        hasRule: true,
        conditioned: true
    },
    {
        type: "traits",
        id: nanoid(),
        properties: ["consequences"],
        conditioned: true,
        heading: "Consequences"
    },
    {
        type: "traits",
        id: nanoid(),
        properties: ["skills"],
        conditioned: true,
        hasRule: false,
        heading: "Skills"
    },
    {
        type: "traits",
        id: nanoid(),
        properties: ["stunts"],
        markdown: true,
        dice: false,
        conditioned: true,
        heading: "Stunts"
    },
    {
        type: "traits",
        id: nanoid(),
        properties: ["items"],
        heading: "Items",
        conditioned: true,
        markdown: true,
        dice: false
    },
    {
        type: "traits",
        id: nanoid(),
        properties: ["extras"],
        heading: "Extras",
        conditioned: true,
        markdown: true,
        dice: false
    }
];

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
            hasRule: false
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
                            type: "inline",
                            id: "ba68494bf919",
                            properties: [],
                            nested: [
                                {
                                    type: "property",
                                    id: "596a89b90ac9",
                                    properties: ["rare_01"],
                                    fallback: "-",
                                    conditioned: true,
                                    markdown: true,
                                    dice: false,
                                    display: "  "
                                },
                                {
                                    type: "property",
                                    id: "3b591bc93858",
                                    properties: ["rare_02"],
                                    fallback: "-",
                                    conditioned: true,
                                    markdown: true,
                                    dice: false,
                                    display: " "
                                },
                                {
                                    type: "property",
                                    id: "3bcab8fab86a",
                                    properties: ["rare_03"],
                                    fallback: "-",
                                    conditioned: true,
                                    display: " ",
                                    markdown: true,
                                    dice: false
                                },
                                {
                                    type: "property",
                                    id: "58e9985a2a69",
                                    properties: ["rare_04"],
                                    fallback: "-",
                                    conditioned: true,
                                    markdown: true,
                                    dice: false,
                                    display: " "
                                }
                            ]
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
            type: "group",
            id: "5b2a1888ea7a",
            properties: [],
            nested: [
                {
                    type: "traits",
                    id: "b979abb9c8db",
                    properties: ["spells0"],
                    fallback: "",
                    conditioned: true,
                    markdown: true,
                    dice: false
                },
                {
                    type: "traits",
                    id: "5a591889389b",
                    properties: ["spells1"],
                    fallback: "-",
                    hasRule: false,
                    conditioned: true,
                    markdown: true,
                    dice: false
                },
                {
                    type: "traits",
                    id: "38abd929495b",
                    properties: ["spells2"],
                    fallback: "-",
                    hasRule: false,
                    markdown: true,
                    dice: false,
                    conditioned: true
                },
                {
                    type: "traits",
                    id: "29590ac9991a",
                    properties: ["spells3"],
                    fallback: "-",
                    markdown: true,
                    dice: false,
                    conditioned: true,
                    hasRule: false
                },
                {
                    type: "traits",
                    id: "bbdae818fb3a",
                    properties: ["spells4"],
                    fallback: "-",
                    markdown: true,
                    dice: false,
                    conditioned: true,
                    hasRule: false
                }
            ]
        },
        {
            type: "group",
            id: "388b38a988a9",
            properties: [],
            nested: [
                {
                    type: "inline",
                    id: "ca39991848aa",
                    properties: [],
                    nested: [
                        {
                            type: "inline",
                            id: "d9695a9aebfa",
                            properties: [],
                            nested: []
                        },
                        {
                            type: "inline",
                            id: "99fad9aaea39",
                            properties: [],
                            nested: [
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
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    name: "Basic Pathfinder 2e Layout",
    id: "path-2e-block"
};
