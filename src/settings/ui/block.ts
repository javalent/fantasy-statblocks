import type { Monster } from "@types";
import copy from "fast-copy";
import { Modal, Notice, Setting } from "obsidian";
import type { StatblockItem, PropertyItem } from "src/data/constants";
import type StatBlockPlugin from "src/main";

export class BlockModal extends Modal {
    block: StatblockItem;
    saved: boolean;
    constructor(public plugin: StatBlockPlugin, block?: StatblockItem) {
        super(plugin.app);
        if (block) this.block = copy(block);
        this.containerEl.addClass("statblock-edit-block");
    }
    get group() {
        return ["group", "inline"].contains(this.block.type);
    }
    onOpen() {
        this.display();
    }
    buildProperties(el: HTMLDivElement) {
        el.empty();
        if (!this.group) {
            if (this.block.type == "subheading") {
                const container = el.createDiv(
                    "statblock-additional-container"
                );
                let tempProp = "";
                new Setting(container)
                    .setHeading()
                    .setName("Link Monster Properties")
                    .addText((t) =>
                        t
                            .setPlaceholder("property")
                            .setValue(tempProp)
                            .onChange((v) => (tempProp = v))
                    )
                    .addExtraButton((b) =>
                        b.setIcon("plus-with-circle").onClick(() => {
                            if (!tempProp || !tempProp.length) {
                                new Notice(
                                    "A valid property must be supplied."
                                );
                                return;
                            }
                            this.block.properties.push(
                                tempProp as keyof Monster
                            );
                            this.buildProperties(el);
                        })
                    );
                const additional = container.createDiv("additional");
                for (const property of this.block.properties) {
                    new Setting(additional)
                        .setName(property)
                        .addExtraButton((b) =>
                            b.setIcon("trash").onClick(() => {
                                this.block.properties =
                                    this.block.properties.filter(
                                        (p) => p != property
                                    );
                                this.buildProperties(el);
                            })
                        );
                }
            } else {
                new Setting(el).setName("Link Monster Property").addText((t) =>
                    t.setValue(this.block.properties[0]).onChange((v) => {
                        this.block.properties[0] = v as keyof Monster;
                    })
                );
            }
            if (this.block.type == "property" || this.block.type == "saves") {
                new Setting(this.contentEl)
                    .setName("Display Text")
                    .setDesc("This text will be used for the property name.")
                    .addText((t) => {
                        t.setValue(
                            (this.block as PropertyItem).display
                        ).onChange(
                            (v) => ((this.block as PropertyItem).display = v)
                        );
                    });
            }
        }
    }
    buildConditions(el: HTMLDivElement) {
        el.empty();
        new Setting(el)
            .setName("Conditional")
            .setDesc(
                "The block will not be added if the associated properties are not present."
            )
            .addToggle((t) => {
                t.setValue(this.block.conditioned).onChange((v) => {
                    this.block.conditioned = v;

                    this.buildConditions(el);
                });
            });
        if (!this.block.conditioned && !this.group) {
            new Setting(el)
                .setName("Fallback")
                .setDesc("If not present, this text will be displayed.")
                .addText((t) => {
                    if (!this.block.fallback) {
                        this.block.fallback = "-";
                    }
                    t.setValue(this.block.fallback).onChange((v) => {
                        this.block.fallback = v;
                    });
                });
        }
        new Setting(this.contentEl)
            .setName("Has Rule")
            .setDesc(
                "If present, the block will have a horizontal rule placed after it."
            )
            .addToggle((t) => {
                t.setValue(this.block.hasRule).onChange(
                    (v) => (this.block.hasRule = v)
                );
            });
    }
    async display() {
        this.titleEl.setText("Edit Block");

        this.buildProperties(this.contentEl.createDiv());
        this.buildConditions(this.contentEl.createDiv());

        this.buildButtons(this.contentEl.createDiv());
    }

    buildButtons(el: HTMLDivElement) {
        el.empty();
        new Setting(el)
            .addButton((b) =>
                b
                    .setCta()
                    .setIcon("checkmark")
                    .setTooltip("save")
                    .onClick(() => {
                        this.saved = true;
                        this.close();
                    })
            )
            .addExtraButton((b) =>
                b
                    .setIcon("cross-in-box")
                    .setTooltip("cancel")
                    .onClick(() => {
                        this.close();
                    })
            );
    }

    buildProperty(el: HTMLElement) {}
}