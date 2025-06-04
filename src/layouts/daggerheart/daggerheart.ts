import { nanoid } from "src/util/util";
import type { DefaultLayout, Layout, StatblockItem } from "../layout.types";

export const LayoutDaggerheartAdversary: DefaultLayout = {
    blocks: [
        {
            "type": "group",
            "id": "ebba4bf9d878",
            "properties": [],
            "nested": [
                {
                    "type": "heading",
                    "id": "89998949fb0b",
                    "properties": [
                        "name"
                    ],
                    "size": 1,
                    "fallback": "-",
                    "conditioned": true
                }
            ]
        },
        {
            "type": "group",
            "id": "7ba8a9d9d968",
            "properties": [],
            "nested": [
                {
                    "type": "property",
                    "id": "982ba9097959",
                    "properties": [
                        "tier"
                    ],
                    "fallback": "",
                    "callback": "return monster.tier + \" \" + monster.type;",
                    "conditioned": true,
                    "display": "Tier"
                }
            ],
            "cls": "daggerheart-adversary-tier"
        },
        {
            "type": "group",
            "id": "48780938f9a8",
            "properties": [],
            "nested": [
                {
                    "type": "text",
                    "id": "a8196bebf98a",
                    "properties": [
                        "description"
                    ],
                    "text": "",
                    "fallback": "-",
                    "conditioned": true
                }
            ],
            "heading": "",
            "cls": "daggerheart-adversary-description"
        },
        {
            "type": "group",
            "id": "eb5b3a8a9ac9",
            "properties": [],
            "nested": [
                {
                    "type": "property",
                    "id": "a8988bca599a",
                    "properties": [
                        "motives_and_tactics"
                    ],
                    "fallback": "-",
                    "display": "Motives & Tactics:"
                }
            ],
            "hasRule": true,
            "cls": "daggerheart-adversary-motives"
        },
        {
            "type": "group",
            "id": "c90a4a79fb0b",
            "properties": [],
            "nested": [
                {
                    "type": "inline",
                    "id": "ab385a3b1869",
                    "properties": [],
                    "nested": [
                        {
                            "type": "property",
                            "id": "781b3bdbd86b",
                            "properties": [
                                "difficulty"
                            ],
                            "fallback": "-",
                            "display": "Difficulty:",
                            "conditioned": true
                        },
                        {
                            "type": "property",
                            "id": "5ae888f87b98",
                            "properties": [
                                "thresholds"
                            ],
                            "fallback": "-",
                            "display": "Thresholds"
                        },
                        {
                            "type": "property",
                            "id": "eb3bf8ebdb2a",
                            "properties": [
                                "hp"
                            ],
                            "fallback": "-",
                            "display": "HP:"
                        },
                        {
                            "type": "property",
                            "id": "08a959d9282b",
                            "properties": [
                                "stress"
                            ],
                            "fallback": "-",
                            "display": "Stress:"
                        }
                    ]
                },
                {
                    "type": "inline",
                    "id": "694abb2acaf9",
                    "properties": [],
                    "nested": [
                        {
                            "type": "property",
                            "id": "58a80a396ba9",
                            "properties": [
                                "atk"
                            ],
                            "fallback": "-",
                            "display": "ATK:"
                        },
                        {
                            "type": "property",
                            "id": "cb48eb0918aa",
                            "properties": [
                                "attack"
                            ],
                            "fallback": "-",
                            "display": "Attack:",
                            "callback": "return monster.attack + \" - \" + monster.range + \" - \" + monster.damage;"
                        }
                    ],
                    "hasRule": true
                },
                {
                    "type": "property",
                    "id": "0a99fa7a9b3b",
                    "properties": [
                        "experience"
                    ],
                    "fallback": "-",
                    "display": "Experience:",
                    "conditioned": true
                }
            ],
            "hasRule": false
        },
        {
            "type": "traits",
            "id": "eb590bb8cb9b",
            "properties": [
                "feats"
            ],
            "fallback": "-",
            "heading": "Features",
            "conditioned": true,
            "headingProp": false,
            "callback": "return property.text;"
        }
    ],
    id: "daggerheart-adversary",
    name: "Daggerheart Adversary",
    edited: false
};

export const LayoutDaggerheartCard: DefaultLayout = {
    blocks: [
        {
            "type": "group",
            "id": "fae98b382b8b",
            "properties": [],
            "nested": [
                {
                    "type": "inline",
                    "id": "488aea38d9a9",
                    "properties": [],
                    "nested": [
                        {
                            "type": "javascript",
                            "id": "685908eb3b9a",
                            "conditioned": false,
                            "code": "const ribbonBlock = document.createElement(\"div\");\nribbonBlock.classList.add(\"daggerheart-card-ribbon\");\n\nconst levelBlock = document.createElement(\"div\");\nlevelBlock.classList.add(\"card-level\");\n\nconst levelText = document.createElement(\"span\");\nlevelText.innerHTML = monster.level;\n\nlevelBlock.append(levelText);\n\nconst domainBlock = document.createElement(\"div\");\ndomainBlock.classList.add(\"card-domain\");\ndomainBlock.classList.add(monster.domain);\n\nconst domainText = document.createElement(\"span\");\ndomainText.innerText = monster.domain;\ndomainBlock.append(domainText)\n\nribbonBlock.append(levelBlock);\nribbonBlock.append(domainBlock);\n\nconsole.log(monster);\n\nreturn ribbonBlock;"
                        },
                        {
                            "type": "group",
                            "id": "7b59baf8aa08",
                            "properties": [],
                            "nested": [
                                {
                                    "type": "property",
                                    "id": "094b19aabb38",
                                    "properties": [
                                        "recall"
                                    ],
                                    "fallback": "-",
                                    "conditioned": true
                                }
                            ]
                        }
                    ],
                    "conditioned": false
                },
                {
                    "type": "image",
                    "id": "9a0baa691af9",
                    "properties": [
                        "image"
                    ],
                    "fallback": "-"
                },
                {
                    "type": "group",
                    "id": "995ac80a7b5a",
                    "properties": [],
                    "nested": [
                        {
                            "type": "javascript",
                            "id": "cb3a08baabfb",
                            "conditioned": false,
                            "code": "const headingBlock = document.createElement(\"div\");\nheadingBlock.classList.add(\"daggerheart-heading\");\n\nconst typeBlock = document.createElement(\"div\");\ntypeBlock.classList.add(\"card-type\");\ntypeBlock.classList.add(monster.domain);\n\nconst typeText = document.createElement(\"span\");\ntypeText.innerText = monster.type;\ntypeBlock.append(typeText)\n\nheadingBlock.append(typeBlock);\n\nreturn headingBlock;"
                        }
                    ],
                    "hasRule": false
                },
                {
                    "type": "group",
                    "id": "098a5a785abb",
                    "properties": [],
                    "nested": [
                        {
                            "type": "heading",
                            "id": "3b8bb868c818",
                            "properties": [
                                "name"
                            ],
                            "size": 1,
                            "fallback": "Card Name"
                        }
                    ],
                    "hasRule": false
                },
                {
                    "type": "group",
                    "id": "cbbaeab91a3b",
                    "properties": [],
                    "nested": [
                        {
                            "type": "property",
                            "id": "281afa3a39d9",
                            "properties": [
                                "text"
                            ],
                            "fallback": "-"
                        }
                    ]
                }
            ],
            "cls": "daggerheart-card"
        }
    ],
    id: "daggerheart-card",
    name: "Daggerheart Card",
    edited: false
};

export const LayoutDaggerheartEnvironment: DefaultLayout = {
    blocks: [
        {
            "type": "group",
            "id": "9beb08f99a5a",
            "properties": [],
            "nested": [
                {
                    "type": "heading",
                    "id": "89998949fb0b",
                    "properties": [
                        "name"
                    ],
                    "size": 1,
                    "fallback": "-",
                    "conditioned": true
                },
                {
                    "type": "property",
                    "id": "982ba9097959",
                    "properties": [
                        "tier"
                    ],
                    "fallback": "",
                    "callback": "return monster.tier + \" \" + monster.type;",
                    "conditioned": true,
                    "display": "Tier"
                },
                {
                    "type": "text",
                    "id": "a8196bebf98a",
                    "properties": [
                        "description"
                    ],
                    "text": "",
                    "fallback": "-",
                    "conditioned": true
                },
                {
                    "type": "property",
                    "id": "a8988bca599a",
                    "properties": [
                        "impulses"
                    ],
                    "fallback": "-",
                    "display": "Impulses:",
                    "conditioned": true
                },
                {
                    "type": "group",
                    "id": "c90a4a79fb0b",
                    "properties": [],
                    "nested": [
                        {
                            "type": "inline",
                            "id": "ab385a3b1869",
                            "properties": [],
                            "nested": [
                                {
                                    "type": "property",
                                    "id": "781b3bdbd86b",
                                    "properties": [
                                        "difficulty"
                                    ],
                                    "fallback": "-",
                                    "display": "Difficulty:",
                                    "conditioned": true
                                }
                            ]
                        },
                        {
                            "type": "inline",
                            "id": "694abb2acaf9",
                            "properties": [],
                            "nested": [
                                {
                                    "type": "property",
                                    "id": "58a80a396ba9",
                                    "properties": [
                                        "potential_adversaries"
                                    ],
                                    "fallback": "-",
                                    "display": "Potential Adversaries:",
                                    "conditioned": true
                                }
                            ],
                            "hasRule": true
                        }
                    ],
                    "hasRule": false
                },
                {
                    "type": "traits",
                    "id": "eb590bb8cb9b",
                    "properties": [
                        "feats"
                    ],
                    "fallback": "-",
                    "heading": "Features",
                    "conditioned": true,
                    "headingProp": false,
                    "callback": "return property.text;"
                }
            ],
            "heading": "",
            "cls": "daggerheart-environment"
        }
    ],
    id: "daggerheart-environment",
    name: "Daggerheart Environment",
    edited: false
};