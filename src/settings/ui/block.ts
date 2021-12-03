import { Modal, Setting } from "obsidian";
import type { StatblockItem, PropertyItem } from "src/data/constants";
import type StatBlockPlugin from "src/main";

export class BlockModal extends Modal {
    constructor(public plugin: StatBlockPlugin, public block?: StatblockItem) {
        super(plugin.app);
    }
    onOpen() {
        this.display();
    }
    async display() {
        this.titleEl.setText("Edit Block");

        const properties = this.contentEl.createDiv();
        new Setting(properties)
            .setName("Link Monster Property")
            .addButton((b) => b.setIcon("plus-with-circle"));
        if (this.block.type == "property" || this.block.type == "saves") {
            new Setting(this.contentEl)
                .setName("Display Text")
                .setDesc("This text will be used for the property name.")
                .addText((t) => {
                    t.setValue((this.block as PropertyItem).display).onChange(
                        (v) => ((this.block as PropertyItem).display = v)
                    );
                });
        }

        new Setting(this.contentEl)
            .setName("Conditional")
            .setDesc(
                "The block will not be added if the property is not present."
            )
            .addToggle((t) => {});
        if (!this.block.conditioned) {
            new Setting(this.contentEl)
                .setName("Fallback")
                .setDesc("If not present, this text will be displayed.")
                .addText((t) => {
                    if (!this.block.fallback) {
                        this.block.fallback = "-";
                    }
                    t.setValue(this.block.fallback).onChange(
                        (v) => (this.block.fallback = v)
                    );
                });
        }
        new Setting(this.contentEl)
            .setName("Has Rule")
            .setDesc(
                "If present, the block will have a horizontal rule placed after it."
            )
            .addToggle((t) => {});
    }

    buildProperty(el: HTMLElement) {}
}
