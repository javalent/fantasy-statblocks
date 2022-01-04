import { MarkdownRenderChild } from "obsidian";
import {
    Layout,
    Layout5e,
    Statblock5e,
    StatblockItem
} from "../data/constants";
import type { Monster } from "@types";

import Statblock from "./Statblock.svelte";
import type StatBlockPlugin from "src/main";

export default class StatBlockRenderer extends MarkdownRenderChild {
    topBar: HTMLDivElement;
    bottomBar: HTMLDivElement;
    loaded: boolean = false;
    statblockEl: HTMLDivElement;
    contentEl: HTMLDivElement;
    constructor(
        container: HTMLElement,
        public monster: Monster,
        private plugin: StatBlockPlugin,
        private canSave: boolean,
        public context: string,
        public layout: Layout = Layout5e
    ) {
        super(container);

        const statblock = new Statblock({
            target: this.containerEl,
            props: {
                context: this.context,
                monster: this.monster,
                statblock: this.layout.blocks,
                plugin: this.plugin,
                canSave: this.canSave
            }
        });
        statblock.$on("save", () => {
            this.plugin.saveMonster({ ...this.monster, source: "Homebrew" });
        });

        statblock.$on("export", () => {
            this.plugin.exportAsPng(
                this.monster.name,
                this.containerEl.firstElementChild
            );
        });
    }
}
