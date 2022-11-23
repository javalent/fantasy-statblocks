import { App, ButtonComponent, Modal } from "obsidian";
import { Layout5e } from "src/layouts/basic5e";
import { MarkdownRenderChild } from "obsidian";
import type { Monster, Trait } from "@types";

import Statblock from "./Statblock.svelte";
import type StatBlockPlugin from "src/main";

import fastCopy from "fast-copy";
import type { Layout } from "src/layouts/types";
import { transformTraits } from "src/util/util";

export default class StatBlockRenderer extends MarkdownRenderChild {
    topBar: HTMLDivElement;
    bottomBar: HTMLDivElement;
    loaded: boolean = false;
    statblockEl: HTMLDivElement;
    contentEl: HTMLDivElement;
    constructor(
        container: HTMLElement,
        monster: Monster,
        public plugin: StatBlockPlugin,
        canSave: boolean,
        context: string,
        public layout: Layout = Layout5e
    ) {
        super(container);

        const statblock = new Statblock({
            target: this.containerEl,
            props: {
                context,
                monster: this.transform(monster),
                statblock: layout.blocks,
                layout: layout.name,
                plugin,
                renderer: this,
                canSave
            }
        });
        statblock.$on("save", async () => {
            if (
                plugin.bestiary.has(monster.name) &&
                !(await confirmWithModal(
                    plugin.app,
                    "This will overwrite an existing monster in settings. Are you sure?"
                ))
            )
                return;
            plugin.saveMonster({
                ...fastCopy(monster),
                source: "Homebrew",
                layout: layout.name
            });
        });

        statblock.$on("export", () => {
            plugin.exportAsPng(
                monster.name,
                this.containerEl.firstElementChild
            );
        });
    }
    transform(monster: Monster): Monster {
        if (
            !("extends" in monster) ||
            !(
                Array.isArray(monster.extends) ||
                typeof monster.extends == "string"
            ) ||
            !monster.extends.length
        ) {
            return monster;
        }

        const extensions = this.getExtensions(monster);

        let TraitBlocks = this.layout.blocks
            .filter((b) => b.type == "traits")
            .flatMap((p) => p.properties);
        const traitsHolder = {};
        for (const trait of TraitBlocks) {
            let traitArray: Trait[] = [];
            for (const m of [...extensions]) {
                traitArray = transformTraits(
                    traitArray,
                    (m[trait] as Trait[]) ?? []
                );
            }
            Object.assign(traitsHolder, {
                [trait]: traitArray
            });
        }
        const ret = Object.assign({}, ...extensions, monster, traitsHolder);

        return ret;
    }
    getExtensions(monster: Monster): Monster[] {
        let extensions: Monster[] = [fastCopy(monster)];
        if (monster.extends && monster.extends.length) {
            for (const extension of [monster.extends].flat()) {
                const extensionMonster = this.plugin.bestiary.get(extension);
                if (!extensionMonster) continue;
                extensions.push(...this.getExtensions(extensionMonster));
            }
        }

        return extensions;
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
