import {
    App,
    debounce,
    Modal,
    normalizePath,
    Notice,
    PluginSettingTab,
    prepareSimpleSearch,
    Setting,
    TextComponent,
    TFolder
} from "obsidian";

import type StatBlockPlugin from "src/main";
import StatblockCreator from "./StatblockCreator.svelte";
import { ViewMonsterModal } from "src/settings/suggester";

import fastCopy from "fast-copy";

import "./settings.css";
import Importer from "src/importers/importer";
import { FolderSuggestionModal } from "src/util/folder";
import { EditMonsterModal } from "./modal";
import { Layout5e } from "src/layouts/basic5e";
import type { Layout } from "src/layouts/types";
import { DefaultLayouts } from "src/layouts";
import copy from "fast-copy";
import type { Monster } from "@types";

export default class StatblockSettingTab extends PluginSettingTab {
    importer: Importer;
    results: Monster[] = [];
    filter: Setting;
    constructor(app: App, private plugin: StatBlockPlugin) {
        super(app, plugin);
        this.importer = new Importer(this.plugin);
    }

    async display(): Promise<void> {
        try {
            let { containerEl } = this;

            containerEl.empty();

            containerEl.addClass("statblock-settings");

            containerEl.createEl("h2", { text: "TTRPG Statblock Settings" });

            this.generateTopSettings(containerEl.createDiv());
            this.generateParseSettings(containerEl.createDiv());

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
            console.error(e);
            new Notice(
                "There was an error displaying the settings tab for 5e Statblocks."
            );
        }
    }

    generateTopSettings(container: HTMLDivElement) {
        container.empty();
        new Setting(container).setHeading().setName("General Settings");
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
    generateParseSettings(containerEl: HTMLDivElement) {
        containerEl.empty();
        new Setting(containerEl).setHeading().setName("Note Parsing");
        new Setting(containerEl)
            .setName("Parse Frontmatter for Creatures")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "The plugin will watch the vault for creatures defined in note frontmatter."
                    });
                    e.createEl("br");
                    e.createEl("br");
                    e.createSpan({
                        text: `The "Parse Frontmatter for Creatures" command can also be used.`
                    });
                })
            )
            .addToggle((t) => {
                t.setValue(this.plugin.settings.autoParse).onChange(
                    async (v) => {
                        this.plugin.settings.autoParse = v;
                        if (v) {
                            this.plugin.watcher.start();
                        }
                        await this.plugin.saveSettings();
                    }
                );
            });
        new Setting(containerEl)
            .setName("Bestiary Folder")
            .setDesc(
                "The plugin will only parse notes inside this folder and its children."
            )
            .addText(async (text) => {
                let folders = this.app.vault
                    .getAllLoadedFiles()
                    .filter((f) => f instanceof TFolder);

                text.setPlaceholder(this.plugin.settings.path ?? "/");
                const modal = new FolderSuggestionModal(this.app, text, [
                    ...(folders as TFolder[])
                ]);

                modal.onClose = async () => {
                    const v = text.inputEl.value?.trim()
                        ? text.inputEl.value.trim()
                        : "/";
                    this.plugin.settings.path = normalizePath(v);
                    await this.plugin.saveSettings();
                };

                text.inputEl.onblur = async () => {
                    const v = text.inputEl.value?.trim()
                        ? text.inputEl.value.trim()
                        : "/";
                    this.plugin.settings.path = normalizePath(v);
                    await this.plugin.saveSettings();
                };
            });
    }
    generateLayouts(containerEl: HTMLDivElement) {
        containerEl.empty();
        new Setting(containerEl).setHeading().setName("Layouts");
        const statblockCreatorContainer = containerEl.createDiv(
            "statblock-additional-container"
        );
        new Setting(statblockCreatorContainer)
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
                for (const layout of DefaultLayouts) {
                    d.addOption(layout.name, layout.name);
                }
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
        if (
            !this.plugin.settings.layouts.find((l) => l.name == layout.name) &&
            layout.name != Layout5e.name
        )
            return layout;
        const names = [
            Layout5e.name,
            ...this.plugin.settings.layouts
                .filter((l) => l.name.contains(`${layout.name} Copy`))
                .map((l) => l.name)
        ];

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

        for (const layout of DefaultLayouts) {
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
                });
        }

        for (const layout of this.plugin.settings.layouts) {
            new Setting(layoutContainer)
                .setName(layout.name)
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
                    b.setIcon("import-glyph")
                        .setTooltip("Export as JSON")
                        .onClick(() => {
                            const link = createEl("a");
                            const file = new Blob([JSON.stringify(layout)], {
                                type: "json"
                            });
                            const url = URL.createObjectURL(file);
                            link.href = url;
                            link.download = `${layout.name}.json`;
                            link.click();
                            URL.revokeObjectURL(url);
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

    generateImports(containerEl: HTMLDivElement) {
        containerEl.empty();
        new Setting(containerEl)
            .setHeading()
            .setName("Import Homebrew Creatures");
        const importSettingsContainer = containerEl.createDiv(
            "statblock-additional-container"
        );

        new Setting(importSettingsContainer).setDesc(
            "Import creatures from creature files. Monsters are stored by name, so only the last creature by that name will be saved. This is destructive - any saved creature will be overwritten."
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
    generateMonsters(containerEl: HTMLDivElement) {
        containerEl.empty();
        new Setting(containerEl).setHeading().setName("Homebrew Creatures");
        const additionalContainer = containerEl.createDiv(
            "statblock-additional-container statblock-monsters"
        );
        new Setting(additionalContainer)
            .setName("Add Creature")
            .addButton((b) => {
                b.setIcon("plus-with-circle").onClick(() => {
                    const modal = new EditMonsterModal(this.plugin);
                    modal.onClose = () => {
                        this.generateMonsters(containerEl);
                    };
                    modal.open();
                });
            });
        let monsterFilter: TextComponent;

        const ancestor = this.containerEl.closest(".statblock-settings");
        const { backgroundColor, paddingTop } = getComputedStyle(ancestor);

        const filters = additionalContainer.createDiv({
            cls: "statblock-monster-filter",
            attr: {
                style: `--statblock-filter-offset: ${paddingTop}; --statblock-filter-bg: ${backgroundColor}`
            }
        });
        this.filter = new Setting(filters)
            .setClass("statblock-filter-container")

            .addSearch((t) => {
                t.setPlaceholder("Search Monsters").onChange(
                    debounce((v) => {
                        this.showSearchResults(additional, v);
                    }, 100)
                );
            })
            .addExtraButton((b) => {
                b.setIcon("trash")
                    .setTooltip("Delete All Filtered Monsters")
                    .onClick(() => {
                        const modal = new ConfirmModal(
                            this.results.length,
                            this.plugin.app
                        );
                        modal.onClose = async () => {
                            if (modal.saved) {
                                await this.plugin.deleteMonsters(
                                    ...(this.results?.map((m) => m.name) ?? [])
                                );
                                this.generateMonsters(containerEl);
                            }
                        };
                        modal.open();
                    });
            });
        this.setFilterDesc();
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
                    this.displayed.add(source);
                } else {
                    this.displayed.delete(source);
                }
                this.showSearchResults(additional, "");
            };
            li.createEl("label", {
                attr: {
                    for: "input_" + source
                },
                text: source
            });
        }
        const additional = additionalContainer.createDiv("additional");
        if (!this.plugin.data.size) {
            additional
                .createDiv({
                    attr: {
                        style: "display: flex; justify-content: center; padding-bottom: 18px;"
                    }
                })
                .createSpan({
                    text: "No saved creatures! Create one to see it here."
                });
            return;
        }
        setImmediate(() => this.showSearchResults(additional, ""));
    }
    setFilterDesc() {
        this.filter.setDesc(
            createFragment((e) => {
                e.createSpan({
                    text: `Managing ${
                        this.plugin.settings.monsters.length
                    } homebrew creature${
                        this.plugin.settings.monsters.length == 1 ? "" : "s"
                    }.`
                });
                e.createEl("p", {
                    attr: {
                        style: "margin: 0;"
                    }
                }).createEl("small", {
                    text: `Displaying: ${this.results.length} homebrew creatures.`
                });
            })
        );
    }
    showSearchResults(additional: HTMLDivElement, search: string) {
        additional.empty();
        for (const item of this.performFuzzySearch(search)) {
            const content = new Setting(additional)
                .setName(item.name)
                .setDesc(item.source);
            content
                .addExtraButton((b) => {
                    b.setIcon("info")
                        .setTooltip("View")
                        .onClick(() => {
                            const modal = new ViewMonsterModal(
                                this.plugin,
                                item
                            );
                            modal.open();
                        });
                })
                .addExtraButton((b) => {
                    b.setIcon("pencil")
                        .setTooltip("Edit")
                        .onClick(() => {
                            const modal = new EditMonsterModal(
                                this.plugin,
                                item
                            );
                            modal.open();
                            modal.onClose = () => {};
                        });
                })
                .addExtraButton((b) => {
                    b.setIcon("trash")
                        .setTooltip("Delete")
                        .onClick(() => this.plugin.deleteMonster(item.name));
                });
        }
        this.setFilterDesc();
    }
    resources: Monster[] = copy(this.plugin.sorted);
    displayed: Set<string> = new Set(this.plugin.sources);
    performFuzzySearch(input: string) {
        const results: Monster[] = [];
        for (const resource of this.resources) {
            if (!this.displayed.has(resource.source)) continue;
            let result =
                prepareSimpleSearch(input)(resource.name) ??
                prepareSimpleSearch(input)(resource.source);
            if (result) {
                results.push(resource);
            }
        }
        this.results = results.slice(0, 100);
        return this.results;
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
