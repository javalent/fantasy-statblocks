import {
    App,
    Modal,
    Notice,
    PluginSettingTab,
    Setting,
    TextComponent
} from "obsidian";
import { Layout, Layout5e } from "src/data/constants";
import type StatBlockPlugin from "src/main";
import StatblockCreator from "./StatblockCreator.svelte";
import { MonsterSuggester } from "src/util/suggester";

import fastCopy from "fast-copy";

import "./settings.css";
import Importer from "src/importers/importer";

export default class StatblockSettingTab extends PluginSettingTab {
    constructor(app: App, private plugin: StatBlockPlugin) {
        super(app, plugin);
    }

    async display(): Promise<void> {
        try {
            let { containerEl } = this;

            containerEl.empty();

            containerEl.addClass("statblock-settings");

            containerEl.createEl("h2", { text: "TTRPG Statblock Settings" });

            this.generateTopSettings(containerEl.createDiv());

            this.generateLayouts(containerEl.createDiv());

            this.generateImports(containerEl.createDiv());

            this.generateMonsters(containerEl.createDiv());

            const div = containerEl.createDiv("coffee");
            div.createEl("a", {
                href: "https://www.buymeacoffee.com/valentine195"
            }).createEl("img", {
                attr: {
                    src: "https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=valentine195&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=ff0000"
                }
            });
        } catch (e) {
            new Notice(
                "There was an error displaying the settings tab for 5e Statblocks."
            );
        }
    }
    generateMonsters(containerEl: HTMLDivElement) {
        containerEl.empty();
        const additionalContainer = containerEl.createDiv(
            "statblock-additional-container statblock-monsters"
        );
        let monsterFilter: TextComponent;
        const filters = additionalContainer.createDiv(
            "statblock-monster-filter"
        );
        const searchMonsters = new Setting(filters)
            .setClass("statblock-filter-container")
            .setName("Homebrew Monsters")
            .addSearch((t) => {
                t.setPlaceholder("Search Monsters");
                monsterFilter = t;
            })
            .addButton((b) => {
                b.setIcon("trash")
                    .setCta()
                    .setTooltip("Delete Filtered Monsters")
                    .onClick(() => {
                        const modal = new ConfirmModal(
                            suggester.filteredItems.length,
                            this.plugin.app
                        );
                        modal.onClose = async () => {
                            if (modal.saved) {
                                await this.plugin.deleteMonsters(
                                    ...(suggester.filteredItems?.map(
                                        (m) => m.item.name
                                    ) ?? [])
                                );
                                this.generateMonsters(containerEl);
                            }
                        };
                        modal.open();
                    });
            });

        const additional = additionalContainer.createDiv("additional");
        if (!this.plugin.data.size) {
            additional
                .createDiv({
                    attr: {
                        style: "display: flex; justify-content: center; padding-bottom: 18px;"
                    }
                })
                .createSpan({
                    text: "No saved monsters! Create one to see it here."
                });
            return;
        }

        let suggester = new MonsterSuggester(
            this.plugin,
            monsterFilter,
            additional,
            new Set(this.plugin.sources)
        );

        const sourcesSetting = filters.createEl("details");
        sourcesSetting.createEl("summary", { text: "Filter Sources" });
        const list = sourcesSetting.createEl(
            "ul",
            "contains-task-list task-list-inline markdown-preview-view"
        );

        for (let source of this.plugin.sources) {
            const li = list.createEl("li", "task-list-item");
            li.createEl("input", {
                attr: {
                    id: "input_" + source,
                    checked: true
                },
                type: "checkbox",
                cls: "task-list-item-checkbox"
            }).onclick = (evt) => {
                const target = evt.target as HTMLInputElement;
                if (target.checked) {
                    suggester.displayed.add(source);
                } else {
                    suggester.displayed.delete(source);
                }
                suggester._onInputChanged();
            };
            li.createEl("label", {
                attr: {
                    for: "input_" + source
                },
                text: source
            });
        }

        suggester.onRemoveItem = async (monster) => {
            try {
                await this.plugin.deleteMonster(monster.name);
            } catch (e) {
                new Notice(
                    `There was an error deleting the monster:${
                        `\n\n` + e.message
                    }`
                );
            }
            suggester._onInputChanged();
        };
        let last = suggester.filteredItems;
        suggester.onInputChanged = () => {
            if (suggester.filteredItems == last) return;
            searchMonsters.setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: `Manage homebrew monsters. Currently: ${
                            suggester.filteredItems.length
                        } monster${
                            suggester.filteredItems.length == 1 ? "" : "s"
                        }.`
                    });
                    if (suggester.filteredItems.length > suggester.limit) {
                        e.createEl("p", {
                            attr: {
                                style: "margin: 0;"
                            }
                        }).createEl("small", {
                            text: `Displaying: ${suggester.limit}. Filter to see more.`
                        });
                    }
                })
            );
        };
        suggester._onInputChanged();
    }
    importer = new Importer(this.plugin);
    generateImports(containerEl: HTMLDivElement) {
        const importSettingsContainer = containerEl.createDiv(
            "statblock-additional-container"
        );

        new Setting(importSettingsContainer)
            .setName("Import Monsters")
            .setDesc(
                "Import monsters from monster files. Monsters are stored by name, so only the last monster by that name will be saved. This is destructive - any saved monster will be overwritten."
            );

        const importAdditional =
            importSettingsContainer.createDiv("additional");
        const importAppFile = new Setting(importAdditional)
            .setName("Import DnDAppFile")
            .setDesc("Only import content that you own.");
        const inputAppFile = createEl("input", {
            attr: {
                type: "file",
                name: "dndappfile",
                accept: ".xml",
                multiple: true
            }
        });

        inputAppFile.onchange = async () => {
            const { files } = inputAppFile;
            if (!files.length) return;
            try {
                const { files } = inputAppFile;
                if (!files.length) return;
                const monsters = await this.importer.import(files, "appfile");
                if (monsters && monsters.length) {
                    await this.plugin.saveMonsters(monsters);
                }
                this.display();
            } catch (e) {}
        };

        importAppFile.addButton((b) => {
            b.setButtonText("Choose File(s)").setTooltip(
                "Import DnDAppFile Data"
            );
            b.buttonEl.addClass("statblock-file-upload");
            b.buttonEl.appendChild(inputAppFile);
            b.onClick(() => inputAppFile.click());
        });

        const importImprovedInitiative = new Setting(importAdditional)
            .setName("Import Improved Initiative Data")
            .setDesc("Only import content that you own.");
        const inputImprovedInitiative = createEl("input", {
            attr: {
                type: "file",
                name: "improvedinitiative",
                accept: ".json",
                multiple: true
            }
        });

        inputImprovedInitiative.onchange = async () => {
            const { files } = inputImprovedInitiative;
            if (!files.length) return;
            try {
                const { files } = inputImprovedInitiative;
                if (!files.length) return;
                const monsters = await this.importer.import(files, "improved");
                if (monsters && monsters.length) {
                    await this.plugin.saveMonsters(monsters);
                }
                this.display();
            } catch (e) {}
        };

        importImprovedInitiative.addButton((b) => {
            b.setButtonText("Choose File(s)").setTooltip(
                "Import Improved Initiative Data"
            );
            b.buttonEl.addClass("statblock-file-upload");
            b.buttonEl.appendChild(inputImprovedInitiative);
            b.onClick(() => inputImprovedInitiative.click());
        });

        const importCritterDB = new Setting(importAdditional)
            .setName("Import CritterDB Data")
            .setDesc("Only import content that you own.");
        const inputCritterDB = createEl("input", {
            attr: {
                type: "file",
                name: "critterdb",
                accept: ".json",
                multiple: true
            }
        });

        inputCritterDB.onchange = async () => {
            const { files } = inputCritterDB;
            if (!files.length) return;
            try {
                const { files } = inputCritterDB;
                if (!files.length) return;
                const monsters = await this.importer.import(files, "critter");
                if (monsters && monsters.length) {
                    await this.plugin.saveMonsters(monsters);
                }
                this.display();
            } catch (e) {}
        };

        importCritterDB.addButton((b) => {
            b.setButtonText("Choose File(s)").setTooltip(
                "Import CritterDB Data"
            );
            b.buttonEl.addClass("statblock-file-upload");
            b.buttonEl.appendChild(inputCritterDB);
            b.onClick(() => inputCritterDB.click());
        });

        const import5eTools = new Setting(importAdditional)
            .setName("Import 5e.tools Data")
            .setDesc("Only import content that you own.");
        const input5eTools = createEl("input", {
            attr: {
                type: "file",
                name: "fivetools",
                accept: ".json",
                multiple: true
            }
        });

        input5eTools.onchange = async () => {
            const { files } = input5eTools;
            if (!files.length) return;
            const monsters = await this.importer.import(files, "5e");
            if (monsters && monsters.length) {
                await this.plugin.saveMonsters(monsters);
            }
            this.display();
        };

        import5eTools.addButton((b) => {
            b.setButtonText("Choose File(s)").setTooltip(
                "Import 5e.tools Data"
            );
            b.buttonEl.addClass("statblock-file-upload");
            b.buttonEl.appendChild(input5eTools);
            b.onClick(() => input5eTools.click());
        });
        const importTetra = new Setting(importAdditional)
            .setName("Import TetraCube Data")
            .setDesc("Only import content that you own.");
        const inputTetra = createEl("input", {
            attr: {
                type: "file",
                name: "tetra",
                accept: ".json, .monster",
                multiple: true
            }
        });

        inputTetra.onchange = async () => {
            const { files } = inputTetra;
            if (!files.length) return;
            const monsters = await this.importer.import(files, "tetra");
            if (monsters && monsters.length) {
                await this.plugin.saveMonsters(monsters);
            }
            this.display();
        };

        importTetra.addButton((b) => {
            b.setButtonText("Choose File(s)").setTooltip(
                "Import TetraCube Data"
            );
            b.buttonEl.addClass("statblock-file-upload");
            b.buttonEl.appendChild(inputTetra);
            b.onClick(() => inputTetra.click());
        });
    }

    generateTopSettings(container: HTMLDivElement) {
        new Setting(container)
            .setName("Enable Export to PNG")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: 'Add "Export to PNG" button by default. Use '
                    });
                    e.createEl("code", { text: "export: false" });
                    e.createSpan({
                        text: " to disable per-statblock."
                    });
                })
            )
            .setDisabled(!this.plugin.canUseDiceRoller)
            .addToggle((t) =>
                t.setValue(this.plugin.settings.useDice).onChange(async (v) => {
                    this.plugin.settings.useDice = v;
                    await this.plugin.saveSettings();
                })
            );
        new Setting(container)
            .setName("Integrate Dice Roller")
            .setDesc(
                createFragment((e) => {
                    if (this.plugin.canUseDiceRoller) {
                        e.createSpan({
                            text: "Add Dice Roller dice to statblocks by default. Use "
                        });
                        e.createEl("code", { text: "dice: false" });
                        e.createSpan({
                            text: " to disable per-statblock."
                        });
                    } else {
                        e.createSpan({
                            text: "This setting is only usable with the Dice Roller plugin enabled."
                        });
                    }
                })
            )
            .setDisabled(!this.plugin.canUseDiceRoller)
            .addToggle((t) =>
                t.setValue(this.plugin.settings.useDice).onChange(async (v) => {
                    this.plugin.settings.useDice = v;
                    await this.plugin.saveSettings();
                })
            );
        new Setting(container)
            .setName("Render Dice Rolls")
            .setDesc(
                createFragment((e) => {
                    if (this.plugin.canUseDiceRoller) {
                        e.createSpan({
                            text: "Roll graphical dice inside statblocks by default. Use "
                        });
                        e.createEl("code", { text: "render: false" });
                        e.createSpan({
                            text: " to disable per-statblock."
                        });
                    } else {
                        e.createSpan({
                            text: "This setting is only usable with the Dice Roller plugin enabled."
                        });
                    }
                })
            )
            .setDisabled(!this.plugin.canUseDiceRoller)
            .addToggle((t) =>
                t
                    .setValue(this.plugin.settings.renderDice)
                    .onChange(async (v) => {
                        this.plugin.settings.renderDice = v;
                        await this.plugin.saveSettings();
                    })
            );
    }
    generateLayouts(containerEl: HTMLDivElement) {
        const statblockCreatorContainer = containerEl.createDiv(
            "statblock-additional-container"
        );
        new Setting(statblockCreatorContainer)
            .setName("Layouts")
            .setDesc(
                createFragment((el) => {
                    el.createSpan({
                        text: "New statblock layouts can be created and managed here. A specific statblock can be used for a creature using the "
                    });
                    el.createEl("code", { text: "statblock" });
                    el.createSpan({ text: " parameter." });
                })
            )
            .addButton((b) =>
                b
                    .setIcon("plus-with-circle")
                    .setTooltip("Add New Statblock")
                    .onClick(() => {
                        const modal = new CreateStatblockModal(this.plugin);
                        modal.onClose = async () => {
                            if (!modal.saved) return;
                            this.plugin.settings.layouts.push(
                                this.getDuplicate(modal.layout)
                            );
                            await this.plugin.saveSettings();
                            this.buildCustomLayouts(layoutContainer);
                        };
                        modal.open();
                    })
            );
        const statblockAdditional =
            statblockCreatorContainer.createDiv("additional");
        new Setting(statblockAdditional)
            .setName("Default Layout")
            .setDesc(
                "Change the default statblock layout used, if not specified."
            )
            .addDropdown(async (d) => {
                d.addOption(Layout5e.name, Layout5e.name);
                for (const layout of this.plugin.settings.layouts) {
                    d.addOption(layout.name, layout.name);
                }

                if (
                    !this.plugin.settings.default ||
                    !this.plugin.settings.layouts.find(
                        ({ name }) => name == this.plugin.settings.default
                    )
                ) {
                    this.plugin.settings.default = Layout5e.name;
                    await this.plugin.saveSettings();
                }

                d.setValue(this.plugin.settings.default ?? Layout5e.name);

                d.onChange(async (v) => {
                    this.plugin.settings.default = v;
                    await this.plugin.saveSettings();
                });
            });
        new Setting(statblockAdditional)
            .setName("Show Advanced Options")
            .setDesc("Show advanced options when editing layout blocks.")
            .addToggle((t) =>
                t
                    .setValue(this.plugin.settings.showAdvanced)
                    .onChange(async (v) => {
                        this.plugin.settings.showAdvanced = v;
                        await this.plugin.saveSettings();
                    })
            );

        const layoutContainer =
            statblockCreatorContainer.createDiv("additional");

        this.buildCustomLayouts(layoutContainer);
    }
    getDuplicate(layout: Layout) {
        if (!this.plugin.settings.layouts.find((l) => l.name == layout.name))
            return layout;
        const names = this.plugin.settings.layouts
            .filter((l) => l.name.contains(`${layout.name} Copy`))
            .map((l) => l.name);

        let temp = `${layout.name} Copy`;

        let name = temp;
        let index = 1;
        while (names.includes(name)) {
            name = `${temp} (${index})`;
            index++;
        }
        return {
            blocks: fastCopy(layout.blocks),
            name: name
        };
    }
    buildCustomLayouts(layoutContainer: HTMLDivElement) {
        layoutContainer.empty();
        new Setting(layoutContainer)
            .setName(Layout5e.name)
            .addExtraButton((b) => {
                b.setIcon("duplicate-glyph")
                    .setTooltip("Create Copy")
                    .onClick(async () => {
                        this.plugin.settings.layouts.push(
                            this.getDuplicate(Layout5e)
                        );
                        await this.plugin.saveSettings();
                        this.buildCustomLayouts(layoutContainer);
                    });
            });
        for (const layout of this.plugin.settings.layouts) {
            new Setting(layoutContainer)
                .setName(layout.name)
                .addExtraButton((b) => {
                    b.setIcon("duplicate-glyph")
                        .setTooltip("Create Copy")
                        .onClick(async () => {
                            this.plugin.settings.layouts.push(
                                this.getDuplicate(layout)
                            );
                            await this.plugin.saveSettings();
                            this.buildCustomLayouts(layoutContainer);
                        });
                })
                .addExtraButton((b) => {
                    b.setIcon("pencil")
                        .setTooltip("Edit")
                        .onClick(() => {
                            const modal = new CreateStatblockModal(
                                this.plugin,
                                layout
                            );
                            modal.onClose = async () => {
                                if (!modal.saved) return;
                                this.plugin.settings.layouts.splice(
                                    this.plugin.settings.layouts.indexOf(
                                        layout
                                    ),
                                    1,
                                    modal.layout
                                );
                                await this.plugin.saveSettings();
                                this.buildCustomLayouts(layoutContainer);
                            };
                            modal.open();
                        });
                })
                .addExtraButton((b) => {
                    b.setIcon("trash")
                        .setTooltip("Delete")
                        .onClick(async () => {
                            this.plugin.settings.layouts =
                                this.plugin.settings.layouts.filter(
                                    (l) => l.name !== layout.name
                                );
                            await this.plugin.saveSettings();

                            this.buildCustomLayouts(layoutContainer);
                        });
                });
        }
    }
}

class CreateStatblockModal extends Modal {
    creator: StatblockCreator;
    layout: Layout;
    saved: boolean = false;
    constructor(
        public plugin: StatBlockPlugin,
        layout: Layout = {
            name: "Layout",
            blocks: []
        }
    ) {
        super(plugin.app);
        this.layout = fastCopy(layout);
    }

    onOpen() {
        this.display();
    }

    display() {
        this.titleEl.createSpan({ text: "Create Layout" });
        this.creator = new StatblockCreator({
            target: this.contentEl,
            props: {
                layout: this.layout,
                plugin: this.plugin
            }
        });

        this.creator.$on("saved", () => {
            this.saved = true;
            this.close();
        });
        this.creator.$on("cancel", () => {
            this.close();
        });
    }
}

class ConfirmModal extends Modal {
    saved: boolean = false;
    constructor(public filtered: number, app: App) {
        super(app);
    }
    onOpen() {
        this.titleEl.setText("Are you sure?");
        this.contentEl.createEl("p", {
            text: `This will delete ${this.filtered} creatures. This cannot be undone.`
        });
        new Setting(this.contentEl)
            .setClass("no-border-top")
            .addButton((b) => {
                b.setIcon("checkmark")
                    .setCta()
                    .onClick(() => {
                        this.saved = true;
                        this.close();
                    });
            })
            .addExtraButton((b) =>
                b.setIcon("cross").onClick(() => {
                    this.saved = true;
                    this.close();
                })
            );
    }
}
