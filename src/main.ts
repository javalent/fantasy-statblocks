import {
    addIcon,
    MarkdownPostProcessorContext,
    Notice,
    parseYaml,
    Plugin,
    TFile
} from "obsidian";
import domtoimage from "dom-to-image";

import { BESTIARY_BY_NAME } from "./data/srd-bestiary";
import StatBlockRenderer from "./view/statblock";
import { transformTraits } from "./util/util";
import {
    EXPORT_ICON,
    EXPORT_SYMBOL,
    Layout,
    Layout5e,
    SAVE_ICON,
    SAVE_SYMBOL
} from "./data/constants";
import type { Monster, StatblockParameters, Trait } from "@types";
import StatblockSettingTab from "./settings/settings";
import fastCopy from "fast-copy";

import "./main.css";
import { sort } from "fast-sort";
import type { Plugins } from "../../obsidian-overload";
import type { HomebrewCreature } from "../../obsidian-initiative-tracker/@types";
import { Watcher } from "./watcher/watcher";
declare module "obsidian" {
    interface App {
        plugins: {
            getPlugin<T extends keyof Plugins>(plugin: T): Plugins[T];
        };
    }
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
    showAdvanced: boolean;
    version: {
        major: number;
        minor: number;
        patch: number;
    };
    path: string;
    autoParse: boolean;
}

const DEFAULT_DATA: StatblockData = {
    monsters: [],
    layouts: [],
    default: Layout5e.name,
    useDice: true,
    renderDice: false,
    export: true,
    showAdvanced: false,
    version: {
        major: null,
        minor: null,
        patch: null
    },
    path: "/",
    autoParse: false
};

class ReadOnlyMap extends Map {
    constructor(map: ReadonlyMap<string, Monster>) {
        super();
        for (const [key, value] of map) {
            super.set(key, value);
        }
    }
    set(key: any, value: any) {
        console.error("The statblock bestiary is read only.");
        return this;
    }
}

export default class StatBlockPlugin extends Plugin {
    settings: StatblockData;
    data: Map<string, Monster>;
    _bestiary: Map<string, Monster>;
    get bestiary() {
        return new ReadOnlyMap(this._bestiary);
    }
    watcher = new Watcher(this);
    private _sorted: Monster[] = [];
    get canUseDiceRoller() {
        return this.app.plugins.getPlugin("obsidian-dice-roller") != null;
    }
    getRoller(str: string) {
        if (!this.canUseDiceRoller) return;
        const roller = this.app.plugins
            .getPlugin("obsidian-dice-roller")
            .getRoller(str, "statblock", true);
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
        console.log("TTRPG StatBlocks loaded");

        await this.loadSettings();
        await this.loadMonsterData();

        await this.saveSettings();

        this.watcher.load();

        this.addCommand({
            id: "parse-frontmatter",
            name: "Parse Frontmatter for Creatures",
            callback: () => {
                this.watcher.start(true);
            }
        });

        addIcon(
            "dropzone-grip",
            `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="grip-lines-vertical" class="svg-inline--fa fa-grip-lines-vertical fa-w-8" role="img" viewBox="0 0 256 512"><path fill="currentColor" d="M96 496V16c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16v480c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16zm128 0V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v480c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16z"/></svg>`
            /*  `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="grip-vertical" class="svg-inline--fa fa-grip-vertical fa-w-10" role="img" viewBox="0 0 320 512"><path fill="currentColor" d="M96 32H32C14.33 32 0 46.33 0 64v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160H32c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zM288 32h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32zm0 160h-64c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32v-64c0-17.67-14.33-32-32-32z"/></svg>`*/
        );
        addIcon(
            "statblock-conditioned",
            `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="far" data-icon="question-circle" class="svg-inline--fa fa-question-circle fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z"/></svg>`
        );
        addIcon(
            "dice-roller-dice",
            `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="dice" class="svg-inline--fa fa-dice fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M592 192H473.26c12.69 29.59 7.12 65.2-17 89.32L320 417.58V464c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48V240c0-26.51-21.49-48-48-48zM480 376c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm-46.37-186.7L258.7 14.37c-19.16-19.16-50.23-19.16-69.39 0L14.37 189.3c-19.16 19.16-19.16 50.23 0 69.39L189.3 433.63c19.16 19.16 50.23 19.16 69.39 0L433.63 258.7c19.16-19.17 19.16-50.24 0-69.4zM96 248c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z"/></svg>`
        );

        this.addSettingTab(new StatblockSettingTab(this.app, this));

        addIcon(SAVE_SYMBOL, SAVE_ICON);
        addIcon(EXPORT_SYMBOL, EXPORT_ICON);

        this._bestiary = new Map([...BESTIARY_BY_NAME, ...this.data]);

        Object.defineProperty(window, "bestiary", {
            value: this.bestiary,
            writable: false,
            configurable: true
        });

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
            data?.map(([name, monster]) => {
                return [name, fastCopy(monster)];
            }) ?? []
        );
    }

    async saveMonster(
        monster: Monster,
        sortFields: boolean = true,
        save: boolean = true
    ) {
        if (!monster.name) return;
        this.data.set(monster.name, monster);
        this._bestiary.set(monster.name, monster);

        if (save) {
            await this.saveSettings();
        }

        if (sortFields)
            this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
                (m) => m.name
            );
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

    async deleteMonsters(...monsters: string[]) {
        for (const monster of monsters) {
            if (!this.data.has(monster)) continue;
            this.data.delete(monster);
            this._bestiary.delete(monster);
        }
        await this.saveSettings();

        this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
            (m) => m.name
        );
    }

    async deleteMonster(monster: string, sortFields = true, save = true) {
        if (!this.data.has(monster)) return;
        this.data.delete(monster);
        this._bestiary.delete(monster);

        if (BESTIARY_BY_NAME.has(monster)) {
            this._bestiary.set(monster, BESTIARY_BY_NAME.get(monster));
        }

        if (save) await this.saveSettings();

        if (sortFields)
            this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
                (m) => m.name
            );
    }

    private _transformData(
        data: Map<string, Monster>
    ): Array<[string, Monster]> {
        return [...(data ?? [])].map(([name, monster]) => {
            return [name, fastCopy(monster)];
        });
    }
    onunload() {
        //@ts-ignore
        delete window.bestiary;
        this.watcher.unload();
        console.log("TTRPG StatBlocks unloaded");
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

    parseForDice(property: string) {
        const roller = (str: string) => {
            let text: string;
            let original: string;
            if (/\w+ [\+\-]\d+/.test(str.trim())) {
                let [, save, sign, number] =
                    str.match(/(\w+ )([\+\-])(\d+)/) ?? [];
                let mult = 1;
                if (sign === "-") {
                    mult = -1;
                }
                if (!isNaN(Number(number))) {
                    text = `1d20+${mult * Number(number)}`;
                    original = `${save} ${sign}${number}`;
                }
            } else if (/[\+\-]\d+ to hit/.test(str.trim())) {
                let [, sign, number] = str.match(/([\+\-])(\d+)/) ?? [];

                let mult = 1;
                if (sign === "-") {
                    mult = -1;
                }
                if (!isNaN(Number(number))) {
                    text = `1d20+${mult * Number(number)}`;
                    original = str;
                }
            } else if (/\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)/.test(str.trim())) {
                let [, base, dice] =
                    str.match(/(\d+)\s\((\d+d\d+(?:\s*[+\-]\s*\d+)?)\)/) ?? [];
                if (!isNaN(Number(base)) && dice) {
                    text = dice;
                }
            }
            return { text, original };
        };

        const match = (str: string) => {
            return (
                /\w+ [\+\-]\d+/.test(str.trim()) ||
                /[\+\-]\d+ to hit/.test(str.trim()) ||
                /\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)/.test(str.trim())
            );
        };

        return property
            .split(
                /([\+\-]\d+ to hit|\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)|\w+ [\+\-]\d+)/
            )
            .map((v) => (match(v) ? roller(v) : v));
    }

    get defaultLayout() {
        return (
            this.settings.layouts?.find(
                (layout) => layout.name == this.settings.default
            ) ?? Layout5e
        );
    }

    async postprocessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ) {
        try {
            /** Get Parameters */
            let params: StatblockParameters = parseYaml(source);

            //replace escapes
            params = JSON.parse(JSON.stringify(params).replace(/\\/g, ""));

            const canSave = params && "name" in params;

            if (!params || !Object.values(params ?? {}).length) {
                params = Object.assign({}, params, { note: ctx.sourcePath });
            }
            if (params.note) {
                const note = Array.isArray(params.note)
                    ? (<string[]>params.note).flat(Infinity).pop()
                    : params.note;
                const file = await this.app.metadataCache.getFirstLinkpathDest(
                    `${note}`,
                    ctx.sourcePath
                );
                if (file && file instanceof TFile) {
                    const cache = await this.app.metadataCache.getFileCache(
                        file
                    );
                    Object.assign(params, fastCopy(cache.frontmatter) ?? {});
                }
            }
            const monster: Monster = Object.assign(
                {},
                this._bestiary.get(params.monster) ??
                    this._bestiary.get(params.creature)
            );
            //TODO: The traits are breaking because it expects { name, desc }, not array.
            if (monster) {
                let traits = transformTraits(
                    monster.traits ?? [],
                    params.traits ?? []
                );
                let actions = transformTraits(
                    monster.actions ?? [],
                    params.actions ?? []
                );
                let legendary_actions = transformTraits(
                    monster.legendary_actions ?? [],
                    params.legendary_actions ?? []
                );
                let reactions = transformTraits(
                    monster.reactions ?? [],
                    params.reactions ?? []
                );

                Object.assign(params, {
                    traits,
                    actions,
                    reactions,
                    legendary_actions
                });
            }

            if ("image" in params) {
                if (Array.isArray(params.image)) {
                    params.image = params.image.flat(2).join("");
                }
            }
            const toBuild: Monster = Object.assign(
                {},
                monster ?? {},
                params ?? {}
            );

            let layout =
                this.settings.layouts.find(
                    (layout) =>
                        layout.name == toBuild?.layout ||
                        layout.name == toBuild?.statblock
                ) ?? this.defaultLayout;

            el.addClass("statblock-plugin-container");
            el.parentElement?.addClass("statblock-plugin-parent");

            let statblock = new StatBlockRenderer(
                el,
                toBuild,
                this,
                canSave,
                ctx.sourcePath,
                layout
            );

            ctx.addChild(statblock);
        } catch (e) {
            console.error(`Obsidian Statblock Error:\n${e}`);
            let pre = createEl("pre");
            pre.setText(`\`\`\`statblock
There was an error rendering the statblock:
${e.stack
    .split("\n")
    .filter((line: string) => !/^at/.test(line?.trim()))
    .join("\n")}
\`\`\``);
        }
    }

    render(creature: HomebrewCreature, el: HTMLElement) {
        const monster: Monster = Object.assign<
            Partial<Monster>,
            HomebrewCreature
        >(this._bestiary.get(creature.name) ?? {}, { ...creature }) as Monster;
        if (!monster) return null;
        return new StatBlockRenderer(
            el,
            monster,
            this,
            false,
            "",
            this.defaultLayout
        );
    }
}
