import { MarkdownPostProcessorContext, MarkdownView, Plugin } from "obsidian";
import { BESTIARY_BY_NAME } from "./data/srd-bestiary";
import StatBlock from "./statblock";
import {
    getColumns,
    getParamsFromSource,
    spellArrayFrom,
    traitMapFrom
} from "./util";

import "./main.css";

export default class StatBlockPlugin extends Plugin {
    async onload() {
        console.log("5e StatBlocks loaded");

        this.registerMarkdownCodeBlockProcessor(
            "statblock",
            this.postprocessor.bind(this)
        );
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
            let monster: Monster;

            /** Get Parameters */
            const params = getParamsFromSource(source);

            if (params.monster) {
                monster = Object.assign({}, BESTIARY_BY_NAME[params.monster]);

                const traits = traitMapFrom(monster.traits);
                const actions = traitMapFrom(monster.actions);
                const reactions = traitMapFrom(monster.reactions);
                const legendary_actions = traitMapFrom(
                    monster.legendary_actions
                );

                if (params.spells) traits.delete("Spellcasting");
                if (traits.has("Spellcasting")) {
                    const spells = spellArrayFrom(traits.get("Spellcasting"));
                    traits.delete("Spellcasting");
                    params.spells = spells;
                }

                params.traits = new Map([...traits, ...params.traits]);
                params.actions = new Map([...actions, ...params.actions]);
                params.reactions = new Map([...reactions, ...params.reactions]);
                params.legendary_actions = new Map([
                    ...legendary_actions,
                    ...params.legendary_actions
                ]);
            }
            const toBuild = Object.assign(monster ?? {}, params);

            let statblock: StatBlock = new StatBlock(el, toBuild);
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
             * This allows me to get the height of the statblock for proper initial column rendering.
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
            /* console.error(`Obsidian Statblock Error:\n${e}`); */
            let newPre = createEl("pre");
            newPre.createEl("code", {}, (code) => {
                code.innerText = `\`\`\`statblock\n${e.stack
                    .split("\n")
                    .slice(0, 2)
                    .join("\n")}\n\`\`\``;
                el.replaceWith(newPre);
            });
        }
    }
}
