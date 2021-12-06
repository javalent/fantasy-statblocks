import {
    addIcon,
    MarkdownPostProcessorContext,
    MarkdownView,
    Notice,
    Plugin,
    TFile
} from "obsidian";
import domtoimage from "dom-to-image";

import type DiceRollerPlugin from "../../obsidian-dice-roller/src/main";

import { BESTIARY_BY_NAME } from "./data/srd-bestiary";
import StatBlockRenderer from "./view/statblock";
import { getParamsFromSource, renderError } from "./util/util";
import {
    CR,
    EXPORT_ICON,
    EXPORT_SYMBOL,
    Layout,
    Layout5e,
    SAVE_ICON,
    SAVE_SYMBOL
} from "./data/constants";
import type { /* StatblockMonster, */ Monster } from "@types";
import StatblockSettingTab from "./settings/settings";

import "./main.css";
import { sort } from "fast-sort";
declare module "obsidian" {
    interface Workspace {
        on(
            name: "dice-roller:rendered-result",
            callback: (result: number) => void
        ): EventRef;
        on(name: "dice-roller:unload", callback: () => void): EventRef;
    }
}
export interface StatblockData {
    monsters: Array<[string, Monster]>;
    layouts: Layout[];
    default: string;
    useDice: boolean;
    renderDice: boolean;
    export: boolean;
    version: {
        major: number;
        minor: number;
        patch: number;
    };
}

const DEFAULT_DATA: StatblockData = {
    monsters: [],
    layouts: [],
    default: Layout5e.name,
    useDice: true,
    renderDice: false,
    export: true,
    version: {
        major: null,
        minor: null,
        patch: null
    }
};

declare module "obsidian" {
    interface App {
        plugins: {
            plugins: {
                "obsidian-dice-roller": DiceRollerPlugin;
            };
        };
    }
}

export default class StatBlockPlugin extends Plugin {
    settings: StatblockData;
    data: Map<string, Monster>;
    bestiary: Map<string, Monster>;
    CR = CR;
    private _sorted: Monster[] = [];
    get canUseDiceRoller() {
        return "obsidian-dice-roller" in this.app.plugins.plugins;
    }
    getRoller(str: string) {
        if (!this.canUseDiceRoller) return;
        const roller = this.app.plugins.plugins[
            "obsidian-dice-roller"
        ].getRoller(str, "statblock", true);
        return roller;
    }
    get sorted() {
        if (!this._sorted.length)
            this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
                (m) => m.name
            );
        return this._sorted;
    }
    get sources() {
        return new Set(Array.from(this.data.values()).map((m) => m.source));
    }
    async onload() {
        console.log("5e StatBlocks loaded");

        await this.loadSettings();
        await this.loadMonsterData();

        await this.saveSettings();

        addIcon(
            "dropzone-grip",
            `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="grip-lines-vertical" class="svg-inline--fa fa-grip-lines-vertical fa-w-8" role="img" viewBox="0 0 256 512"><path fill="currentColor" d="M96 496V16c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16v480c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16zm128 0V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v480c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16z"/></svg>`
            /*  `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="grip-vertical" class="svg-inline--fa fa-grip-vertical fa-w-10" role="img" viewBox="0 0 320 512"><path fill="currentColor" d="M96 32H32C14.33 32 0 46.33 0 64v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zM288 32h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32z"/></svg>`*/
        );
        addIcon(
            "statblock-conditioned",
            `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="question-circle" class="svg-inline--fa fa-question-circle fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.286-2.353 12.415 2.715 16.258l34.699 26.31c5.205 3.947 12.621 3.008 16.665-2.122 17.864-22.658 30.113-35.797 57.303-35.797 20.429 0 45.698 13.148 45.698 32.958 0 14.976-12.363 22.667-32.534 33.976C247.128 238.528 216 254.941 216 296v4c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12v-1.333c0-28.462 83.186-29.647 83.186-106.667 0-58.002-60.165-102-116.531-102zM256 338c-25.365 0-46 20.635-46 46 0 25.364 20.635 46 46 46s46-20.636 46-46c0-25.365-20.635-46-46-46z"/></svg>`
        );
        addIcon(
            "dice-roller-dice",
            `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="dice" class="svg-inline--fa fa-dice fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M592 192H473.26c12.69 29.59 7.12 65.2-17 89.32L320 417.58V464c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48V240c0-26.51-21.49-48-48-48zM480 376c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm-46.37-186.7L258.7 14.37c-19.16-19.16-50.23-19.16-69.39 0L14.37 189.3c-19.16 19.16-19.16 50.23 0 69.39L189.3 433.63c19.16 19.16 50.23 19.16 69.39 0L433.63 258.7c19.16-19.17 19.16-50.24 0-69.4zM96 248c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z"/></svg>`
        );

        this.addSettingTab(new StatblockSettingTab(this.app, this));

        addIcon(SAVE_SYMBOL, SAVE_ICON);
        addIcon(EXPORT_SYMBOL, EXPORT_ICON);

        this.bestiary = new Map([...BESTIARY_BY_NAME, ...this.data]);

        this.registerMarkdownCodeBlockProcessor(
            "statblock",
            this.postprocessor.bind(this)
        );

        this.registerEvent(
            this.app.workspace.on("dice-roller:unload", () => {
                this.settings.useDice = false;
            })
        );
    }
    async loadSettings() {
        const settings = await this.loadData();

        if (settings != undefined && !("version" in settings)) {
            //1.X settings;
            this.settings = { ...DEFAULT_DATA };
            this.settings.monsters = settings;

            await this.loadMonsterData();

            new Notice(
                "5e Statblocks is now TTRPG Statblocks. Check out the ReadMe for more information!"
            );
        } else {
            this.settings = {
                ...DEFAULT_DATA,
                ...settings
            };
        }
        const version = this.manifest.version.split(".");
        this.settings.version = {
            major: Number(version[0]),
            minor: Number(version[1]),
            patch: Number(version[2])
        };
    }
    async saveSettings() {
        this.settings.monsters = this._transformData(this.data);

        await this.saveData(this.settings);
    }
    async loadMonsterData() {
        const data = this.settings.monsters;

        if (!data) this.data = new Map();

        this.data = new Map(
            data.map(([name, monster]) => {
                const statblock = Object.assign({}, monster);

                return [name, statblock];
            })
        );
    }

    async saveMonster(
        monster: Monster,
        sortFields: boolean = true,
        save: boolean = true
    ) {
        if (!monster.name) return;
        /* if (!this.data.has(monster.name)) { */
        this.data.set(monster.name, monster);
        this.bestiary.set(monster.name, monster);

        if (save) {
            await this.saveSettings();
        }

        if (sortFields)
            this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
                (m) => m.name
            );
        /* } */
    }
    async saveMonsters(monsters: Monster[]) {
        for (let monster of monsters) {
            await this.saveMonster(monster, false, false);
        }
        this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
            (m) => m.name
        );
        await this.saveSettings();
    }

    async updateMonster(oldMonster: Monster, newMonster: Monster) {
        this.data.delete(oldMonster.name);
        await this.saveMonster(newMonster);
    }

    async deleteMonster(monster: string) {
        if (!this.data.has(monster)) return;
        this.data.delete(monster);
        this.bestiary.delete(monster);

        await this.saveSettings();

        this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
            (m) => m.name
        );
    }

    private _transformData(
        data: Map<string, Monster>
    ): Array<[string, Monster]> {
        return [...(data ?? [])].map(([name, monster]) => {
            let convMonster = {
                ...monster,
                traits: [...monster.traits],
                actions: [...monster.actions],
                legendary_actions: [...monster.legendary_actions],
                reactions: [...monster.reactions]
            };

            return [name, convMonster];
        });
    }
    onunload() {
        console.log("5e StatBlocks unloaded");
    }

    exportAsPng(name: string, containerEl: Element) {
        function filter(node: HTMLElement) {
            return !node.hasClass || !node.hasClass("clickable-icon");
        }
        const content =
            containerEl.querySelector<HTMLDivElement>(".statblock-content");
        if (content) delete content.style["boxShadow"];
        domtoimage
            .toPng(containerEl, {
                filter: filter,
                style: { height: "100%" }
            })
            .then((url) => {
                const link = document.createElement("a");
                link.download = name + ".png";
                link.href = url;
                link.click();
                link.detach();
            })
            .catch((e) => {
                new Notice(
                    `There was an error creating the image: \n\n${e.message}`
                );
                console.error(e);
            });
    }

    async postprocessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ) {
        try {
            /** Get Parameters */
            const params: Monster = getParamsFromSource(source);

            const canSave = Object.prototype.hasOwnProperty.call(
                params,
                "name"
            );

            const monster: Monster = Object.assign(
                {},
                this.bestiary.get(params.monster) ??
                    this.bestiary.get(params.creature)
            );
            let traits, actions, legendary_actions, reactions;
            if (monster) {
                try {
                    traits = [
                        ...(monster?.traits?.filter(
                            (trait) =>
                                !params.reactions.find(
                                    (param) => param[0] == trait[0]
                                )
                        ) ?? []),
                        ...(params?.traits ?? [])
                    ];
                } catch (e) {
                    throw new Error(
                        "There was an error parsing the provided traits."
                    );
                }
                try {
                    actions = [
                        ...(monster?.actions?.filter(
                            (trait) =>
                                !params.reactions.find(
                                    (param) => param[0] == trait[0]
                                )
                        ) ?? []),
                        ...(params?.actions ?? [])
                    ];
                } catch (e) {
                    throw new Error(
                        "There was an error parsing the provided actions."
                    );
                }
                try {
                    legendary_actions = [
                        ...(monster?.legendary_actions?.filter(
                            (trait) =>
                                !params.reactions.find(
                                    (param) => param[0] == trait[0]
                                )
                        ) ?? []),
                        ...(params?.legendary_actions ?? [])
                    ];
                } catch (e) {
                    throw new Error(
                        "There was an error parsing the provided legendary actions."
                    );
                }
                try {
                    reactions = [
                        ...(monster?.reactions?.filter(
                            (trait) =>
                                !params.reactions.find(
                                    (param) => param[0] == trait[0]
                                )
                        ) ?? []),
                        ...(params?.reactions ?? [])
                    ];
                } catch (e) {
                    throw new Error(
                        "There was an error parsing the provided reactions."
                    );
                }
                Object.assign(params, {
                    traits: traits,
                    actions: actions,
                    reactions: reactions,
                    legendary_actions: legendary_actions
                });
            }

            const toBuild = Object.assign(monster ?? {}, params ?? {});

            let layout =
                this.settings.layouts.find(
                    (layout) => layout.name == params?.layout
                ) ?? Layout5e;

            let statblock = new StatBlockRenderer(
                el,
                toBuild,
                this,
                canSave,
                layout
            );

            ctx.addChild(statblock);
        } catch (e) {
            console.error(`Obsidian Statblock Error:\n${e}`);

            renderError(
                el,
                e.stack
                    .split("\n")
                    .filter((line: string) => !/^at/.test(line?.trim()))
                    .join("\n")
            );
        }
    }
}
