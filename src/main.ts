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

export interface StatblockData {
    monsters: Array<[string, Monster]>;
    layouts: Layout[];
    default: string;
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

        this.addSettingTab(new StatblockSettingTab(this.app, this));

        addIcon(SAVE_SYMBOL, SAVE_ICON);
        addIcon(EXPORT_SYMBOL, EXPORT_ICON);

        this.bestiary = new Map([...BESTIARY_BY_NAME, ...this.data]);

        this.registerMarkdownCodeBlockProcessor(
            "statblock",
            this.postprocessor.bind(this)
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

            let statblock = new StatBlockRenderer(el, toBuild, this, canSave);

            /* statblock.onunload = () => {
                let newPre = createEl("pre");
                newPre.createEl("code", {
                    text: `\`\`\`statblock\n${source}\`\`\``
                });
                statblock.statblockEl.replaceWith(newPre);
            }; */

            const view = this.app.workspace.getActiveViewOfType(MarkdownView);

            /**
             * setImmediate call to allow statblock to be appended to document.
             * This allows the plugin to get the height of the statblock for proper initial column rendering.
             */
            /* let columns = 0;
            statblock.onload = async () => {
                statblock.loaded = true;
                columns = getColumns(view.contentEl);
                if (columns >= 1) statblock.setWidth(columns * 400, true);
                if (columns === 0) statblock.setMaxWidth(400);

                statblock.statblockEl.toggleVisibility(true);
            }; */

            /**
             * Initiate view resize handler to update columns.
             */
            /*  if (view && view instanceof MarkdownView) {
                view.onResize = () => {
                    let c = getColumns(statblock.containerEl.parentElement);

                    if (c == columns) return;
                    columns = c;

                    if (c >= 1) statblock.setWidth(columns * 400);
                    if (c === 0) statblock.setMaxWidth(400);
                };
            } */

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
