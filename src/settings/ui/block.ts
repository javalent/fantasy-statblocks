import copy from "fast-copy";
import { Modal, Notice, Setting, TextAreaComponent } from "obsidian";
import type {
    StatblockItem,
    PropertyItem,
    TraitsItem,
    TableItem,
    TextItem,
    SubHeadingItem,
    HeadingItem,
    GroupItem,
    InlineItem,
    IfElseItem,
    SavesItem,
    SpellsItem,
    CollapseItem,
    JavaScriptItem,
    LayoutItem,
    BasicItem
} from "types/layout";
import type StatBlockPlugin from "src/main";
import TableHeaders from "./TableHeaders.svelte";
import SubheadingProperty from "./SubheadingProperty.svelte";
import IfElseConditions from "./IfElseConditions.svelte";
import { editorFromTextArea, nanoid } from "src/util/util";
import { EditorView } from "@codemirror/view";
import type { Monster } from "index";

export function getModalForBlock(
    plugin: StatBlockPlugin,
    block: IfElseItem,
    layout: string
): IfElseModal;
export function getModalForBlock(
    plugin: StatBlockPlugin,
    block: CollapseItem,
    layout: string
): CollapseModal;
export function getModalForBlock(
    plugin: StatBlockPlugin,
    block: LayoutItem,
    layout: string
): LayoutModal;
export function getModalForBlock(
    plugin: StatBlockPlugin,
    block: GroupItem | InlineItem,
    layout: string
): GroupModal;
export function getModalForBlock(
    plugin: StatBlockPlugin,
    block: StatblockItem,
    layout: string
): BlockModal<StatblockItem>;
export function getModalForBlock(
    plugin: StatBlockPlugin,
    block: StatblockItem,
    layout: string
): BlockModal<StatblockItem> {
    switch (block.type) {
        case "group":
        case "inline": {
            return new GroupModal(plugin, block);
        }
        case "collapse": {
            return new CollapseModal(plugin, block);
        }
        case "ifelse": {
            return new IfElseModal(plugin, block);
        }
        case "javascript": {
            return new JavaScriptModal(plugin, block);
        }
        case "heading": {
            return new HeadingModal(plugin, block);
        }
        case "layout": {
            return new LayoutModal(plugin, block, layout);
        }
        case "property": {
            return new PropertyModal(plugin, block);
        }
        case "saves": {
            return new SavesModal(plugin, block);
        }
        case "spells": {
            return new SpellsModal(plugin, block);
        }
        case "subheading": {
            return new SubheadingModal(plugin, block);
        }
        case "table": {
            return new TableModal(plugin, block);
        }
        case "traits": {
            return new TraitsModal(plugin, block);
        }
        case "text": {
            return new TextModal(plugin, block);
        }
    }
    return new GenericModal(plugin, block);
}

abstract class BlockModal<T extends StatblockItem> extends Modal {
    block: T;
    saved: boolean;

    constructor(public plugin: StatBlockPlugin, block?: T) {
        super(plugin.app);
        if (block) this.block = copy(block);
        this.containerEl.addClass("statblock-edit-block");
    }
    onOpen() {
        this.titleEl.setText("Edit Block");
        this.display();
    }

    abstract display(): Promise<void>;

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

class GroupModal extends BlockModal<GroupItem | InlineItem> {
    async display() {
        this.contentEl.empty();
        new Setting(this.contentEl)
            .setName("Section Heading")
            .setDesc(
                "This text will be used for the section heading. Can be left blank."
            )
            .addText((t) => {
                t.setValue(this.block.heading).onChange(
                    (v) => (this.block.heading = v)
                );
            });
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
        new Setting(this.contentEl)
            .setName("CSS Container Class")
            .setDesc(
                "All nested elements inside this group container will receive this CSS class. If blank, no class will be applied."
            )
            .addText((t) => {
                t.setValue(this.block.cls).onChange(
                    (v) => (this.block.cls = v)
                );
            });
        this.buildButtons(this.contentEl.createDiv());
    }
}
class CollapseModal extends BlockModal<CollapseItem> {
    async display() {
        this.contentEl.empty();
        new Setting(this.contentEl)
            .setName("Section Heading")
            .setDesc(
                "This text will be used for the section heading. Can be left blank."
            )
            .addText((t) => {
                t.setValue(this.block.heading).onChange(
                    (v) => (this.block.heading = v)
                );
            });
        new Setting(this.contentEl)
            .setName("Open by Default")
            .setDesc("The block will start open.")
            .addToggle((t) => {
                t.setValue(this.block.open).onChange(
                    (v) => (this.block.open = v)
                );
            });
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
        this.buildButtons(this.contentEl.createDiv());
    }
}
class JavaScriptModal extends BlockModal<JavaScriptItem> {
    editor: EditorView;
    async display() {
        this.contentEl.empty();

        new Setting(this.contentEl)
            .setName("JavaScript")
            .setHeading()
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "JavaScript blocks can be used to do highly advanced HTML elements. The JavaScript code will be provided the "
                    });
                    e.createEl("code", {
                        text: "monster"
                    });
                    e.createSpan({ text: " and " });
                    e.createEl("code", {
                        text: "property"
                    });
                    e.createSpan({
                        text: "parameters and should return a HTML element, which will be attached to the block's container element."
                    });
                })
            );
        const component = new TextAreaComponent(this.contentEl).setValue(
            this.block.code
        );
        component.inputEl.addClass("statblock-textarea");
        this.editor = editorFromTextArea(
            component.inputEl,
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.block.code = update.state.doc.toString();
                }
            })
        );

        this.buildButtons(this.contentEl.createDiv());
    }
}
class LayoutModal extends BlockModal<LayoutItem> {
    editor: EditorView;
    constructor(
        plugin: StatBlockPlugin,
        block: LayoutItem,
        public layout: string
    ) {
        super(plugin, block);
    }
    hasLayoutNestedAlready(blocks: StatblockItem[]): boolean {
        for (const block of blocks) {
            if (block.type == "layout" && block.layout == this.layout)
                return true;
            if ("nested" in block && this.hasLayoutNestedAlready(block.nested))
                return true;
        }
        return false;
    }
    async display() {
        this.contentEl.empty();

        new Setting(this.contentEl)
            .setName("Layout to Insert")
            .addDropdown((d) => {
                for (const layout of this.plugin.layouts) {
                    if (layout.id == this.layout) continue;
                    if (this.hasLayoutNestedAlready(layout.blocks)) continue;
                    d.addOption(layout.id, layout.name);
                }
                if (this.block.layout) {
                    d.setValue(this.block.layout);
                }
                d.onChange((v) => {
                    this.block.layout = v;
                });
            });

        this.buildButtons(this.contentEl.createDiv());
    }
}
class IfElseModal extends BlockModal<IfElseItem> {
    async display() {
        this.contentEl.empty();

        this.buildConditions(this.contentEl.createDiv());

        this.buildButtons(this.contentEl.createDiv());
    }
    buildConditions(el: HTMLElement) {
        new IfElseConditions({
            target: el,
            props: {
                plugin: this.plugin,
                block: this.block
            }
        });
    }
}

class GenericModal<I extends BasicItem> extends BlockModal<I> {
    async display() {
        this.containerEl.addClass("statblock-block-editor");
        this.contentEl.empty();

        this.buildProperties(this.contentEl.createDiv());
        this.buildSeparator(this.contentEl.createDiv());
        this.buildConditions(this.contentEl.createDiv());
        this.buildDice(this.contentEl.createDiv());

        this.buildAdvanced(
            this.contentEl.createEl("details", {
                cls: "statblock-nested-settings",
                attr: {
                    ...(this.plugin.settings.showAdvanced ? { open: true } : {})
                }
            })
        );

        this.buildButtons(this.contentEl.createDiv());
    }
    buildAdvanced(el: HTMLDetailsElement) {
        el.empty();
        el.ontoggle = () => {
            this.plugin.settings.showAdvanced = el.open;
            this.plugin.saveSettings();
        };
        const summary = el.createEl("summary");
        new Setting(summary).setHeading().setName("Advanced Settings");
        summary.createDiv("collapser").createDiv("handle");
        if (this.plugin.canUseDiceRoller) {
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
                        e.createEl("code", { text: "monster" });
                        e.createSpan({ text: " and " });
                        e.createEl("code", { text: "property" });
                        e.createSpan({
                            text: "parameters and should return a string. For example: "
                        });

                        e.createEl("code", {
                            text: "return 2d6 + monster.stats[2];"
                        });
                    })
                );

            const component = new TextAreaComponent(el).setValue(
                this.block.diceCallback
            );
            component.inputEl.addClasses([
                "statblock-textarea",
                "statblock-textarea-small"
            ]);
            this.editor = editorFromTextArea(
                component.inputEl,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        this.block.diceCallback = update.state.doc.toString();
                    }
                })
            );
        }
    }

    onClose(): void {
        this.editor?.destroy();
    }

    editor: EditorView;

    buildProperties(el: HTMLDivElement) {
        el.empty();
        const block = this.block;
        new Setting(el).setName("Link Monster Property").addText((t) =>
            t.setValue(block.properties[0]).onChange((v) => {
                block.properties[0] = v as keyof Monster;
            })
        );
    }
    buildSeparator(el: HTMLDivElement) {
        return;
    }
    buildConditions(el: HTMLDivElement) {
        el.empty();
        const block = this.block;
        new Setting(el)
            .setName("Conditional")
            .setDesc(
                "The block will not be added if the associated properties are not present."
            )
            .addToggle((t) => {
                t.setValue(block.conditioned).onChange((v) => {
                    block.conditioned = v;

                    this.buildConditions(el);
                });
            });
        if (!this.block.conditioned) {
            new Setting(el)
                .setName("Fallback")
                .setDesc("If not present, this text will be displayed.")
                .addText((t) => {
                    if (!block.fallback) {
                        block.fallback = "-";
                    }
                    t.setValue(block.fallback).onChange((v) => {
                        block.fallback = v;
                    });
                });
        }
        new Setting(el)
            .setName("Has Rule")
            .setDesc(
                "If present, the block will have a horizontal rule placed after it."
            )
            .addToggle((t) => {
                t.setValue(block.hasRule).onChange((v) => (block.hasRule = v));
            });
    }
    buildDice(el: HTMLDivElement) {
        el.empty();
        const block = this.block;
        if (this.plugin.canUseDiceRoller) {
            new Setting(el)
                .setName("Parse for Dice")
                .setDesc(
                    "The plugin will attempt to add dice rollers as specified."
                )

                .addToggle((t) =>
                    t.setValue(block.dice).onChange((v) => {
                        block.dice = v;
                        this.buildDice(el);
                    })
                );
            if (block.dice) {
                new Setting(el.createDiv())
                    .setName("Link Dice to Property")
                    .setDesc(
                        "The dice roller will parse this property instead of the original."
                    )
                    .addText((t) => {
                        t.setValue(block.diceProperty).onChange((v) => {
                            block.diceProperty = v as keyof Monster;
                        });
                    });
            }
        }
    }
}

class MarkdownEnabledModal<
    M extends PropertyItem | TraitsItem | SpellsItem | TextItem | SavesItem
> extends GenericModal<M> {
    buildAdvanced(el: HTMLDetailsElement): void {
        super.buildAdvanced(el);
        new Setting(el)
            .setName("Render as Markdown")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "The block will attempt to render as markdown."
                    });
                })
            )
            .addToggle((t) => {
                t.setValue(this.block.markdown).onChange((v) => {
                    this.block.markdown = v;
                });
            });
    }
}

class HeadingModal extends GenericModal<HeadingItem> {
    buildProperties(el: HTMLDivElement): void {
        super.buildProperties(el);
        new Setting(this.contentEl)
            .setName("Header Size")
            .setDesc("The heading will use this size.")
            .addDropdown((d) => {
                if (!this.block.size) {
                    this.block.size == 1;
                }
                d.addOptions({
                    "1": "H1",
                    "2": "H2",
                    "3": "H3",
                    "4": "H4",
                    "5": "H5",
                    "6": "H6"
                })
                    .setValue(`${this.block.size}`)
                    .onChange((v) => (this.block.size = Number(v)));
            });
    }
}

class PropertyModal extends MarkdownEnabledModal<PropertyItem> {
    buildAdvanced(el: HTMLDetailsElement): void {
        super.buildAdvanced(el);
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
                    e.createEl("code", { text: "monster" });
                    e.createSpan({
                        text: " parameter. The callback should return a string. For example: "
                    });

                    e.createEl("code", { text: "return monster.name" });
                })
            );

        const component = new TextAreaComponent(el).setValue(
            this.block.callback
        );
        this.editor = editorFromTextArea(
            component.inputEl,
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.block.callback = update.state.doc.toString();
                }
            })
        );
    }
    editor: EditorView;
    onClose() {
        this.editor?.destroy();
    }
    buildProperties(el: HTMLDivElement): void {
        super.buildProperties(el);
        new Setting(this.contentEl)
            .setName("Do Not Add Property as CSS Class")
            .setDesc(
                "Enable this to prevent adding the property to the containing HTML element as a CSS class. This can be used to avoid collisions with native Obsidian CSS."
            )
            .addToggle((t) => {
                t.setValue(this.block.doNotAddClass).onChange((v) => {
                    this.block.doNotAddClass = v;
                    this.display();
                });
            });
        new Setting(this.contentEl)
            .setName("Display Text")
            .setDesc("This text will be used for the property name.")
            .addText((t) => {
                t.setValue(this.block.display).onChange(
                    (v) => (this.block.display = v)
                );
            });
    }
}
class SavesModal extends MarkdownEnabledModal<SavesItem> {
    buildProperties(el: HTMLDivElement): void {
        super.buildProperties(el);
        new Setting(this.contentEl)
            .setName("Display Text")
            .setDesc("This text will be used for the property name.")
            .addText((t) => {
                t.setValue(this.block.display).onChange(
                    (v) => (this.block.display = v)
                );
            });
    }
}

class SpellsModal extends MarkdownEnabledModal<SpellsItem> {
    buildProperties(el: HTMLDivElement): void {
        new Setting(this.contentEl)
            .setName("Trait Name")
            .setDesc(
                "Name to display for the Spellcasting trait. Defaults to Spellcasting if not provided."
            )
            .addText((t) => {
                t.setValue(this.block.heading).onChange(
                    (v) => (this.block.heading = v)
                );
            });
    }
}

class SubheadingModal extends GenericModal<SubHeadingItem> {
    buildProperties(el: HTMLDivElement): void {
        el.empty();
        const block = this.block;
        const container = el.createDiv("statblock-additional-container");
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
                        new Notice("A valid property must be supplied.");
                        return;
                    }
                    block.properties.push(tempProp as keyof Monster);
                    this.buildProperties(el);
                })
            );

        const additional = container.createDiv("additional");
        const sub = new SubheadingProperty({
            target: additional,
            props: {
                properties: this.block.properties.map((prop) => {
                    return { prop, id: nanoid() };
                })
            }
        });
        sub.$on("sorted", (e: CustomEvent<(keyof Monster)[]>) => {
            block.properties = [...e.detail];
        });
    }
    buildSeparator(el: HTMLDivElement) {
        el.empty();

        new Setting(el)
            .setName("Separator")
            .setDesc("Text separating properties")
            .addText((t) => {
                if (!this.block.separator) {
                    this.block.separator = " ";

                    t.setValue(this.block.separator).onChange((v) => {
                        this.block.separator = v;
                    });
                }
            });
    }
}
class TableModal extends GenericModal<TableItem> {
    buildAdvanced(el: HTMLDetailsElement): void {
        super.buildAdvanced(el);
        new Setting(el)
            .setHeading()
            .setName("Ability Modifier Calculation")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "Allows a custom modifier for the stat."
                    });
                    e.createEl("br");
                    e.createSpan({ text: "Variable " });
                    e.createEl("code", { text: "stat" });
                    e.createSpan({
                        text: "is accessible, use this to calculate the modifier."
                    });
                })
            );
        const component = new TextAreaComponent(this.contentEl).setValue(
            this.block.modifier
        );
        component.inputEl.addClasses([
            "statblock-textarea",
            "statblock-textarea-small"
        ]);
        this.editor = editorFromTextArea(
            component.inputEl,
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.block.modifier = update.state.doc.toString();
                }
            })
        );
    }
    buildProperties(el: HTMLDivElement): void {
        super.buildProperties(el);
        const container = el.createDiv("statblock-additional-container");
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
                        new Notice("A valid property must be supplied.");
                        return;
                    }
                    this.block.headers.push(tempProp as keyof Monster);
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
            this.block.headers = [...(e.detail?.map((v) => v.name) ?? [])];
        });
        new Setting(el)
            .setName("Calculate Modifiers")
            .setDesc(
                "The block will not attempt to calculate modifiers for table values."
            )
            .addToggle((t) => {
                t.setValue(this.block.calculate).onChange((v) => {
                    this.block.calculate = v;
                });
            });
    }
}

class TraitsModal extends MarkdownEnabledModal<TraitsItem> {
    buildProperties(el: HTMLDivElement): void {
        super.buildProperties(el);
        new Setting(this.contentEl)
            .setName("Do Not Add Property as CSS Class")
            .setDesc(
                "Disable this to prevent adding the property to the containing HTML element as a CSS class. This can be used to avoid collisions with native Obsidian CSS."
            )
            .addToggle((t) => {
                t.setValue(this.block.doNotAddClass).onChange((v) => {
                    this.block.doNotAddClass = v;
                    this.display();
                });
            });
        new Setting(this.contentEl)
            .setName("Use Monster Property for Heading")
            .setDesc(
                "The Section heading will be set to the value of the specified property."
            )
            .addToggle((t) => {
                t.setValue(this.block.headingProp).onChange((v) => {
                    this.block.headingProp = v;
                    this.display();
                });
            });
        new Setting(this.contentEl)
            .setName("Section Heading")
            .setDesc(
                this.block.headingProp
                    ? "The section will use this property for the section heading. If the property does not exist or is blank, the section heading will not appear."
                    : "This text will be used for the section heading. Can be left blank."
            )
            .addText((t) => {
                t.setValue(this.block.heading).onChange(
                    (v) => (this.block.heading = v)
                );
            });
        const subheading = new Setting(this.contentEl)
            .setName("Section Subheading Text")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "Text entered here will appear directly after the section heading, before the actual traits. Use "
                    });
                    e.createEl("code", { text: "{{monster}}" });
                    e.createSpan({
                        text: " to insert the current monster's name."
                    });
                })
            );
        subheading.controlEl.detach();

        new TextAreaComponent(this.contentEl)
            .setValue(this.block.subheadingText)
            .onChange((v) => (this.block.subheadingText = v));
    }
}
class TextModal extends MarkdownEnabledModal<TextItem> {
    buildAdvanced(el: HTMLDetailsElement): void {
        super.buildAdvanced(el);
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
        new TextAreaComponent(el).setValue(this.block.text).onChange((v) => {
            this.block.text = v;
        });
    }
    buildProperties(el: HTMLDivElement): void {
        super.buildProperties(el);
        new Setting(this.contentEl)
            .setName("Use Monster Property for Heading")
            .setDesc(
                "The Section heading will be set to the value of the specified property."
            )
            .addToggle((t) => {
                t.setValue(this.block.headingProp).onChange((v) => {
                    this.block.headingProp = v;
                    this.display();
                });
            });
        new Setting(this.contentEl)
            .setName("Section Heading")
            .setDesc(
                this.block.headingProp
                    ? "The section will use this property for the section heading. If the property does not exist or is blank, the section heading will not appear."
                    : "This text will be used for the section heading. Can be left blank."
            )
            .addText((t) => {
                t.setValue(this.block.heading).onChange(
                    (v) => (this.block.heading = v)
                );
            });
    }
}
