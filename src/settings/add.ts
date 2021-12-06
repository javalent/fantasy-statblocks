import { nanoid } from "src/data/constants";
import type {
    StatblockItemType,
    GroupItem,
    HeadingItem,
    StatblockItem,
    InlineItem,
    PropertyItem,
    SavesItem,
    TraitsItem,
    SpellsItem,
    TableItem,
    SubHeadingItem
} from "src/data/constants";
import type StatBlockPlugin from "src/main";
import { Menu } from "obsidian";

function blockGenerator(type: "group"): GroupItem;
function blockGenerator(type: "heading"): HeadingItem;
function blockGenerator(type: "inline"): InlineItem;
function blockGenerator(type: "property"): PropertyItem;
function blockGenerator(type: "saves"): SavesItem;
function blockGenerator(type: "traits"): TraitsItem;
function blockGenerator(type: "spells"): SpellsItem;
function blockGenerator(type: "subheading"): SubHeadingItem;
function blockGenerator(type: "table"): TableItem;
function blockGenerator(type: StatblockItemType): StatblockItem;
function blockGenerator(type: string): StatblockItem {
    switch (type) {
        case "inline":
        case "group": {
            return {
                type: "group",
                id: nanoid(),
                properties: [],
                nested: []
            };
        }
        case "heading": {
            return {
                type: "heading",
                id: nanoid(),
                properties: []
            };
        }
        case "property": {
            return {
                type: "property",
                id: nanoid(),
                properties: []
            };
        }
        case "saves": {
            return {
                type: "saves",
                id: nanoid(),
                properties: []
            };
        }
        case "traits": {
            return {
                type: "traits",
                id: nanoid(),
                properties: []
            };
        }
        case "spells": {
            return {
                type: "spells",
                id: nanoid(),
                properties: []
            };
        }
        case "subheading": {
            return {
                type: "subheading",
                id: nanoid(),
                properties: []
            };
        }
        case "table": {
            return {
                type: "table",
                id: nanoid(),
                properties: [],
                headers: []
            };
        }
    }
}

const types: Array<[StatblockItemType, string]> = [
    ["group", "Group"],
    ["heading", "Heading"],
    ["inline", "Inline Group"],
    ["property", "Property Line"],
    ["saves", "Saves"],
    ["spells", "Spells"],
    ["subheading", "Subheading"],
    ["table", "Table"],
    ["traits", "Traits"]
];

export const generate = async (
    plugin: StatBlockPlugin,
    evt: MouseEvent
): Promise<StatblockItem | void> => {
    return new Promise((resolve, reject) => {
        const addMenu = new Menu(plugin.app).setNoIcon();
        types.forEach((type) => {
            addMenu.addItem((item) => {
                item.setTitle(type[1]).onClick(() => {
                    const gen = blockGenerator(type[0]);
                    resolve(gen);
                });
            });
        });
        addMenu.onunload = () => {
            resolve();
        };

        addMenu.showAtMouseEvent(evt);
    });
};
