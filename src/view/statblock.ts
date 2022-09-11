import { App, ButtonComponent, Modal } from "obsidian";
import { Layout5e } from "src/layouts/basic5e";
import { MarkdownRenderChild } from "obsidian";
import type { Monster } from "@types";

import Statblock from "./Statblock.svelte";
import type StatBlockPlugin from "src/main";

import fastCopy from "fast-copy";
import type { Layout } from "src/layouts/types";

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
        private icons: boolean,
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
                layout: this.layout.name,
                plugin: this.plugin,
                renderer: this,
                canSave: this.icons
            }
        });
        statblock.$on("save", async () => {
            if (
                !(await confirmWithModal(
                    this.plugin.app,
                    "This will overwrite an existing monster in settings. Are you sure?"
                ))
            )
                return;
            this.plugin.saveMonster({
                ...fastCopy(this.monster),
                source: "Homebrew",
                layout: this.layout.name
            });
        });

        statblock.$on("export", () => {
            this.plugin.exportAsPng(
                this.monster.name,
                this.containerEl.firstElementChild
            );
        });
    }
}

export async function confirmWithModal(
    app: App,
    text: string,
    buttons: { cta: string; secondary: string } = {
        cta: "Yes",
        secondary: "No"
    }
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const modal = new ConfirmModal(app, text, buttons);
        modal.onClose = () => {
            resolve(modal.confirmed);
        };
        modal.open();
    });
}

export class ConfirmModal extends Modal {
    constructor(
        app: App,
        public text: string,
        public buttons: { cta: string; secondary: string }
    ) {
        super(app);
    }
    confirmed: boolean = false;
    async display() {
        new Promise((resolve) => {
            this.contentEl.empty();
            this.contentEl.addClass("confirm-modal");
            this.contentEl.createEl("p", {
                text: this.text
            });
            const buttonEl = this.contentEl.createDiv(
                "fantasy-calendar-confirm-buttons"
            );
            new ButtonComponent(buttonEl)
                .setButtonText(this.buttons.cta)
                .setCta()
                .onClick(() => {
                    this.confirmed = true;
                    this.close();
                });
            new ButtonComponent(buttonEl)
                .setButtonText(this.buttons.secondary)
                .onClick(() => {
                    this.close();
                });
        });
    }
    onOpen() {
        this.display();
    }
}
