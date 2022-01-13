import type { Monster } from "@types";
import copy from "fast-copy";
import {
    ExtraButtonComponent,
    Modal,
    Notice,
    Setting,
    TextAreaComponent
} from "obsidian";
import type {
    StatblockItem,
    PropertyItem,
    TableItem,
    TraitsItem,
    TextItem
} from "src/data/constants";
import type StatBlockPlugin from "src/main";
import TableHeaders from "./TableHeaders.svelte";

export class BlockModal extends Modal {
    block: StatblockItem;
    saved: boolean;
    advanced: boolean = this.plugin.settings.showAdvanced;
    constructor(public plugin: StatBlockPlugin, block?: StatblockItem) {
        super(plugin.app);
        if (block) this.block = copy(block);
        this.containerEl.addClass("statblock-edit-block");
    }
    get group() {
        return ["group", "inline"].contains(this.block.type);
    }
    onOpen() {
        this.titleEl.setText("Edit Block");
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
            if (this.block.type == "traits" || this.block.type == "text") {
                new Setting(this.contentEl)
                    .setName("Section Heading")
                    .setDesc(
                        "This text will be used for the section heading. Can be left blank."
                    )
                    .addText((t) => {
                        t.setValue((this.block as TraitsItem).heading).onChange(
                            (v) => ((this.block as TraitsItem).heading = v)
                        );
                    });
            }
            if (this.block.type == "table") {
                const container = el.createDiv(
                    "statblock-additional-container"
                );
                let tempProp = "";
                new Setting(container)
                    .setHeading()
                    .setName("Table Headers")
                    .addText((t) =>
                        t
                            .setPlaceholder("header")
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
                            (this.block as TableItem).headers.push(
                                tempProp as keyof Monster
                            );
                            this.buildProperties(el);
                        })
                    );
                const additional = container.createDiv("additional");
                new TableHeaders({
                    target: additional,
                    props: {
                        headers: this.block.headers
                    }
                }).$on("sorted", (e: CustomEvent<{ name: string }[]>) => {
                    (this.block as TableItem).headers = [
                        ...(e.detail?.map((v) => v.name) ?? [])
                    ];
                });
                /* for (const property of this.block.headers) {
                    const header = additional.createDiv("header-container");
                    header.createSpan({ text: property });
                    new ExtraButtonComponent(header.createDiv())
                        .setIcon("cross-in-box")
                        .onClick(() => {
                            (this.block as TableItem).headers = (
                                this.block as TableItem
                            ).headers.filter((v) => v != property);
                            this.buildProperties(el);
                        });
                } */
            }
            if (!this.advanced) return;
            if (this.block.type == "text") {
                new Setting(el)
                    .setHeading()
                    .setName("Text to Show")
                    .setDesc(
                        createFragment((e) => {
                            e.createSpan({ text: "The block will " });
                            e.createEl("strong", { text: "always" });
                            e.createSpan({
                                text: " display the text entered here."
                            });
                        })
                    );
                new TextAreaComponent(el)
                    .setValue(this.block.text)
                    .onChange((v) => {
                        (this.block as TextItem).text = v;
                    });
            }
            if (this.block.type == "property") {
                new Setting(el)
                    .setHeading()
                    .setName("Callback")
                    .setDesc(
                        createFragment((e) => {
                            e.createSpan({
                                text: "The block will run the callback and use the returned string as the property."
                            });
                            e.createEl("br");
                            e.createSpan({
                                text: "The callback will receive the "
                            });
                            e.createEl("code", { text: "plugin" });
                            e.createSpan({ text: " and " });
                            e.createEl("code", { text: "monster" });
                            e.createSpan({ text: "parameters." });
                        })
                    );
                new TextAreaComponent(el)
                    .setValue(this.block.callback)
                    .onChange((v) => {
                        (this.block as PropertyItem).callback = v;
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
        new Setting(el)
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
    buildDice(el: HTMLDivElement) {
        el.empty();
        if (!this.group && this.plugin.canUseDiceRoller) {
            new Setting(el)
                .setName("Parse for Dice")
                .setDesc(
                    "The plugin will attempt to add dice rollers as specified."
                )

                .addToggle((t) =>
                    t.setValue(this.block.dice).onChange((v) => {
                        this.block.dice = v;
                        this.buildDice(el);
                    })
                );
            if (this.block.dice) {
                new Setting(el.createDiv())
                    .setName("Link Dice to Property")
                    .setDesc(
                        "The dice roller will parse this property instead of the original."
                    )
                    .addText((t) => {
                        t.setValue(this.block.diceProperty).onChange((v) => {
                            this.block.diceProperty = v as keyof Monster;
                        });
                    });
            }
        }

        if (!this.advanced) return;
        new Setting(el)
            .setHeading()
            .setName("Dice Callback")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "The block will run the callback and use the returned values for the dice strings."
                    });
                    e.createEl("br");
                    e.createSpan({
                        text: "The callback will receive the "
                    });
                    e.createEl("code", { text: "plugin" });
                    e.createSpan({ text: ", " });
                    e.createEl("code", { text: "monster" });
                    e.createSpan({ text: " and " });
                    e.createEl("code", { text: "property" });
                    e.createSpan({ text: "parameters." });
                })
            );
        new TextAreaComponent(el)
            .setValue(this.block.diceCallback)
            .onChange((v) => {
                this.block.diceCallback = v;
            });
    }
    async display() {
        this.contentEl.empty();
        new Setting(this.contentEl)
            .setName("Show Advanced Options")
            .addToggle((t) => {
                t.setValue(
                    this.advanced ?? this.plugin.settings.showAdvanced
                ).onChange((v) => {
                    this.advanced = v;
                    this.display();
                });
            });
        
        this.buildProperties(this.contentEl.createDiv());
        this.buildConditions(this.contentEl.createDiv());
        this.buildDice(this.contentEl.createDiv());

        this.buildButtons(this.contentEl.createDiv());
    }

    buildButtons(el: HTMLDivElement) {
        el.empty();
        new Setting(el)
            .addButton((b) =>
                b
                    .setCta()
                    .setIcon("checkmark")
                    .setTooltip("Save")
                    .onClick(() => {
                        this.saved = true;
                        this.close();
                    })
            )
            .addExtraButton((b) =>
                b
                    .setIcon("cross")
                    .setTooltip("Cancel")
                    .onClick(() => {
                        this.close();
                    })
            );
    }

    buildProperty(el: HTMLElement) {}
}
