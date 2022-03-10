import type StatBlockPlugin from "src/main";
import { Menu } from "obsidian";
import {
    type StatblockItemMap,
    type StatblockItem,
    TypeNames
} from "src/layouts/types";
import { nanoid } from "src/util/util";

function blockGenerator<T extends keyof StatblockItemMap>(
    type: T
): StatblockItemMap[T];
function blockGenerator(type: string): StatblockItem {
    switch (type) {
        case "inline":
        case "group": {
            return {
                type: type,
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
        case "image": {
            return {
                type: "image",
                id: nanoid(),
                properties: []
            };
        }
        case "table": {
            return {
                type: "table",
                id: nanoid(),
                properties: [],
                headers: [],
                calculate: true
            };
        }
        case "text": {
            return {
                type: "text",
                id: nanoid(),
                properties: [],
                text: null
            };
        }
    }
}

export const generate = async (
    plugin: StatBlockPlugin,
    evt: MouseEvent
): Promise<StatblockItem | void> => {
    return new Promise((resolve, reject) => {
        const addMenu = new Menu(plugin.app).setNoIcon();
        TypeNames.forEach((type) => {
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
