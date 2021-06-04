import {
    addIcon,
    MarkdownPostProcessorContext,
    MarkdownView,
    Plugin
} from "obsidian";

import { BESTIARY_BY_NAME } from "./data/srd-bestiary";
import StatBlockRenderer from "./renderer/statblock";
import { getColumns, getParamsFromSource, renderError } from "./util/util";
import { SAVE_ICON, SAVE_SYMBOL } from "./data/constants";
import {
    /* StatblockMonster, */ Monster,
    StatblockMonsterPlugin
} from "@types";
import StatblockSettingTab from "./settings/settings";

import "./main.css";
import { sort } from "fast-sort";

export default class StatBlockPlugin
    extends Plugin
    implements StatblockMonsterPlugin
{
    data: Map<string, Monster>;
    bestiary: Map<string, Monster>;
    private _sorted: Monster[] = [];
    get sorted() {
        if (!this._sorted.length)
            this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
                (m) => m.name
            );
        return this._sorted;
    }
    get sources() {
        console.log("🚀 ~ file: main.ts ~ line 36 ~ getsources ~ sources");

        return new Set(Array.from(this.data.values()).map((m) => m.source));
    }
    async onload() {
        console.log("5e StatBlocks loaded");

        this.data = await this.loadMonsterData();
        this.addSettingTab(new StatblockSettingTab(this.app, this));

        addIcon(SAVE_SYMBOL.toString(), SAVE_ICON);

        this.bestiary = new Map([...BESTIARY_BY_NAME, ...this.data]);

        this.registerMarkdownCodeBlockProcessor(
            "statblock",
            this.postprocessor.bind(this)
        );
    }

    async loadMonsterData() {
        const data = await this.loadData();
        if (!data) return new Map();
        return new Map(
            data.map(([name, monster]: [name: string, monster: any]) => {
                const statblock: Monster = Object.assign({}, monster);

                return [name, statblock];
            })
        );
    }

    async saveMonster(monster: Monster, sortFields: boolean = true) {
        if (!monster.name) return;
        if (!this.data.has(monster.name)) {
            this.data.set(monster.name, monster);
            this.bestiary.set(monster.name, monster);
            await this.saveData(this._transformData(this.data));
            if (sortFields)
                this._sorted = sort<Monster>(
                    Array.from(this.data.values())
                ).asc((m) => m.name);
        }
    }
    async saveMonsters(monsters: Monster[]) {
        for (let monster of monsters) {
            await this.saveMonster(monster, false);
        }
        this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
            (m) => m.name
        );
    }

    async deleteMonster(monster: string) {
        if (!this.data.has(monster)) return;
        this.data.delete(monster);
        this.bestiary.delete(monster);
        await this.saveData(this._transformData(this.data));
        this._sorted = sort<Monster>(Array.from(this.data.values())).asc(
            (m) => m.name
        );
    }

    private _transformData(data: Map<string, Monster>): any[] {
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
                this.bestiary.get(params.monster)
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
            ctx.addChild(statblock);
            statblock.onunload = () => {
                let newPre = createEl("pre");
                newPre.createEl("code", {
                    text: `\`\`\`statblock\n${source}\`\`\``
                });
                statblock.statblockEl.replaceWith(newPre);
            };

            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            const parent = statblock.containerEl.parentElement;

            /**
             * setImmediate call to allow statblock to be appended to document.
             * This allows the plugin to get the height of the statblock for proper initial column rendering.
             */
            let columns = 0;
            setImmediate(() => {
                columns = getColumns(view.contentEl);
                if (columns >= 1) statblock.setWidth(columns * 400);
                if (columns === 0) statblock.setMaxWidth(400);
                statblock.statblockEl.toggleVisibility(true);
            });

            /**
             * Initiate view resize handler to update columns.
             */
            if (view && view instanceof MarkdownView) {
                /* let columns = getColumns(view.contentEl);

                        if (columns >= 1) statblock.setWidth(columns * 400);
                        if (columns === 0) statblock.setMaxWidth(400); */

                view.onResize = () => {
                    let c = getColumns(parent);
                    if (c == columns) return;
                    columns = c;

                    if (c >= 1) statblock.setWidth(columns * 400);
                    if (c === 0) statblock.setMaxWidth(400);
                };
            }
        } catch (e) {
            console.error(`Obsidian Statblock Error:\n${e}`);

            renderError(
                el,
                e.stack
                    .split("\n")
                    .filter((line: string) => !/^at/.test(line?.trim()))
                    .join("\n")
            );

            /* let newPre = createEl("pre");
            newPre.createEl("code", {}, (code) => {
                code.innerText = `\`\`\`statblock\n${e.stack
                    .split("\n")
                    .slice(0, 2)
                    .join("\n")}\n\`\`\``;
                el.replaceWith(newPre);
            }); */
        }
    }
}
