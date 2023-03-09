import {
    App,
    ButtonComponent,
    debounce,
    Modal,
    normalizePath,
    Notice,
    PluginSettingTab,
    prepareSimpleSearch,
    Setting,
    TFolder
} from "obsidian";

import type StatBlockPlugin from "src/main";
import StatblockCreator from "./StatblockCreator.svelte";

import { ViewMonsterModal } from "src/settings/suggester";

import fastCopy from "fast-copy";

import Importer from "src/importers/importer";
import { FolderSuggestionModal } from "src/util/folder";
import { EditMonsterModal } from "./modal";
import { Layout5e } from "src/layouts/basic 5e/basic5e";
import type { DefaultLayout, Layout } from "src/layouts/types";
import { DefaultLayouts } from "src/layouts";
import type { Monster } from "@types";
import { nanoid, stringify } from "src/util/util";

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

            containerEl.createEl("h2", { text: "Fantasy Statblocks Settings" });

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
        new Setting(container)
            .setName("Try to Render Wikilinks")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "The plugin will attempt to detect wikilinks inside Statblocks."
                    });
                    e.createEl("br");
                    e.createEl("strong", {
                        text: "Please note: these links will not be added to the graph."
                    });
                })
            )
            .addToggle((t) =>
                t
                    .setValue(this.plugin.settings.tryToRenderLinks)
                    .onChange(async (v) => {
                        this.plugin.settings.tryToRenderLinks = v;
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(container)
            .setName("Disable 5e SRD")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "Disable the Dungeons & Dragons 5th Edition System Reference Document monsters."
                    });
                })
            )
            .addToggle((t) =>
                t
                    .setValue(this.plugin.settings.disableSRD)
                    .onChange(async (v) => {
                        this.plugin.settings.disableSRD = v;
                        await this.plugin.saveSettings();
                    })
            );
    }
    generateParseSettings(containerEl: HTMLDivElement) {
        containerEl.empty();
        const additionalContainer = containerEl.createDiv(
            "statblock-additional-container"
        );
        new Setting(additionalContainer).setHeading().setName("Note Parsing");
        new Setting(additionalContainer)
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
        new Setting(additionalContainer)
            .setName("Enable Debug Messages")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({
                        text: "Debug messages will be displayed by the file parser."
                    });
                })
            )
            .addToggle((t) =>
                t.setValue(this.plugin.settings.debug).onChange(async (v) => {
                    this.plugin.settings.debug = v;
                    this.plugin.watcher.setDebug();
                    await this.plugin.saveSettings();
                })
            );
        let path: string;
        new Setting(additionalContainer)
            .setName("Bestiary Folder")
            .setDesc(
                "The plugin will only parse notes inside these folders and their children."
            )
            .addText(async (text) => {
                let folders = this.app.vault
                    .getAllLoadedFiles()
                    .filter(
                        (f) =>
                            f instanceof TFolder &&
                            !this.plugin.settings.paths.includes(f.path)
                    );

                text.setPlaceholder("/");
                const modal = new FolderSuggestionModal(this.app, text, [
                    ...(folders as TFolder[])
                ]);

                modal.onClose = async () => {
                    const v = text.inputEl.value?.trim()
                        ? text.inputEl.value.trim()
                        : "/";
                    path = normalizePath(v);
                };

                text.inputEl.onblur = async () => {
                    const v = text.inputEl.value?.trim()
                        ? text.inputEl.value.trim()
                        : "/";
                    path = normalizePath(v);
                };
            })
            .addExtraButton((b) => {
                b.setIcon("plus-with-circle").onClick(async () => {
                    if (!path || !path.length) return;
                    this.plugin.settings.paths.push(normalizePath(path));
                    await this.plugin.saveSettings();
                    await this.plugin.watcher.reparseVault();
                    await this.generateParseSettings(containerEl);
                });
            });

        const paths = additionalContainer.createDiv("additional");
        for (const path of this.plugin.settings.paths) {
            new Setting(paths).setName(path).addExtraButton((b) =>
                b.setIcon("trash").onClick(async () => {
                    this.plugin.settings.paths =
                        this.plugin.settings.paths.filter((p) => p != path);

                    await this.plugin.saveSettings();
                    await this.plugin.watcher.reparseVault();
                    await this.generateParseSettings(containerEl);
                })
            );
        }
    }
    generateLayouts(containerEl: HTMLDivElement) {
        containerEl.empty();
        new Setting(containerEl).setHeading().setName("Layouts");

        const statblockCreatorContainer = containerEl.createDiv(
            "statblock-additional-container"
        );
        statblockCreatorContainer
            .createDiv("setting-item")
            .createDiv()
            .appendChild(
                createFragment((el) => {
                    el.createSpan({
                        text: "New statblock layouts can be created and managed here. A specific statblock can be used for a creature using the "
                    });
                    el.createEl("code", { text: "statblock" });
                    el.createSpan({ text: " parameter." });
                })
            );
        const importFile = new Setting(statblockCreatorContainer)
            .setName("Import From JSON")
            .setDesc("Import a custom layout from a JSON file.");
        const inputFile = createEl("input", {
            attr: {
                type: "file",
                name: "layout",
                accept: ".json",
                multiple: true
            }
        });
        inputFile.onchange = async () => {
            const { files } = inputFile;
            if (!files.length) return;
            try {
                const { files } = inputFile;
                if (!files.length) return;
                for (const file of Array.from(files)) {
                    await new Promise<void>((resolve, reject) => {
                        const reader = new FileReader();

                        reader.onload = async (event) => {
                            try {
                                const layout: Layout = JSON.parse(
                                    event.target.result as string
                                );
                                if (!layout) {
                                    reject(
                                        new Error("Invalid layout imported")
                                    );
                                    return;
                                }
                                if (!layout?.name) {
                                    reject(
                                        new Error(
                                            "Invalid layout imported: layout does not have a name"
                                        )
                                    );
                                    return;
                                }
                                if (!layout?.id) {
                                    layout.id = nanoid();
                                }
                                if (!layout?.blocks) {
                                    reject(
                                        new Error(
                                            "Invalid layout imported: no blocks defined in layout."
                                        )
                                    );
                                    return;
                                }
                                if (
                                    !this.plugin.settings.alwaysImport &&
                                    layout.blocks.find(
                                        (b) => b.type == "javascript"
                                    ) &&
                                    !(await confirm(this.plugin))
                                ) {
                                    resolve();
                                }
                                this.plugin.settings.layouts.push(
                                    this.getDuplicate(layout)
                                );
                                resolve();
                            } catch (e) {
                                reject(e);
                            }
                        };
                        reader.readAsText(file);
                    }).catch((e) => {
                        new Notice(
                            `There was an error importing the layout: \n\n${e}`
                        );
                        console.error(e);
                    });
                }
                await this.plugin.saveSettings();
                inputFile.value = null;
                this.buildCustomLayouts(layoutContainer, containerEl);
            } catch (e) {}
        };

        importFile.addButton((b) => {
            b.setIcon("upload");
            b.buttonEl.addClass("statblock-file-upload");
            b.buttonEl.appendChild(inputFile);
            b.onClick(() => inputFile.click());
        });
        const setting = new Setting(statblockCreatorContainer)
            .setName("Add New Layout")
            .addButton((b) =>
                b
                    .setIcon("plus-with-circle")
                    .setTooltip("Add New Layout")
                    .onClick(() => {
                        const modal = new CreateStatblockModal(this.plugin);
                        modal.onClose = async () => {
                            if (!modal.saved) return;
                            this.plugin.settings.layouts.push(
                                this.getDuplicate(modal.layout)
                            );
                            await this.plugin.saveSettings();
                            this.buildCustomLayouts(
                                layoutContainer,
                                containerEl
                            );
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
                for (const layout of this.plugin.layouts) {
                    d.addOption(layout.id, layout.name);
                }

                if (
                    !this.plugin.settings.default ||
                    !this.plugin.layouts.find(
                        ({ id }) => id == this.plugin.settings.default
                    )
                ) {
                    this.plugin.settings.default = Layout5e.id;
                    await this.plugin.saveSettings();
                }

                d.setValue(this.plugin.settings.default ?? Layout5e.id);

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

        this.buildCustomLayouts(layoutContainer, containerEl);
    }
    getDuplicate(layout: Layout) {
        if (!this.plugin.layouts.find((l) => l.name == layout.name))
            return layout;
        const names = this.plugin.layouts
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
            name,
            id: nanoid()
        };
    }
    buildCustomLayouts(
        layoutContainer: HTMLDivElement,
        outerContainer: HTMLDivElement
    ) {
        layoutContainer.empty();

        for (const layout of this.plugin.settings.defaultLayouts) {
            const setting = new Setting(layoutContainer)
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
                                if (
                                    DefaultLayouts.find(
                                        ({ id }) => id == layout.id
                                    )
                                ) {
                                    (modal.layout as DefaultLayout).edited =
                                        true;
                                }
                                this.plugin.settings.layouts.splice(
                                    this.plugin.settings.layouts.indexOf(
                                        layout
                                    ),
                                    1,
                                    modal.layout
                                );

                                await this.plugin.saveSettings();
                                this.generateLayouts(outerContainer);
                            };
                            modal.open();
                        });
                });
            if (layout.edited) {
                setting.addExtraButton((b) =>
                    b.setIcon("undo").onClick(async () => {
                        const defLayout = DefaultLayouts.find(
                            ({ id }) => id == layout.id
                        );
                        this.plugin.settings.layouts.splice(
                            this.plugin.settings.layouts.indexOf(layout),
                            1,
                            fastCopy(defLayout)
                        );
                        await this.plugin.saveSettings();
                        this.generateLayouts(outerContainer);
                    })
                );
            }

            setting
                .addExtraButton((b) => {
                    b.setIcon("duplicate-glyph")
                        .setTooltip("Create Copy")
                        .onClick(async () => {
                            this.plugin.settings.layouts.push(
                                this.getDuplicate(layout)
                            );
                            await this.plugin.saveSettings();
                            this.buildCustomLayouts(
                                layoutContainer,
                                outerContainer
                            );
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
                                    (l) => l.id !== layout.id
                                );
                            await this.plugin.saveSettings();

                            this.generateLayouts(outerContainer);
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
                                if (
                                    DefaultLayouts.find(
                                        ({ id }) => id == layout.id
                                    )
                                ) {
                                    (modal.layout as DefaultLayout).edited =
                                        true;
                                }
                                this.plugin.settings.layouts.splice(
                                    this.plugin.settings.layouts.indexOf(
                                        layout
                                    ),
                                    1,
                                    modal.layout
                                );

                                await this.plugin.saveSettings();
                                this.generateLayouts(outerContainer);
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
                            this.buildCustomLayouts(
                                layoutContainer,
                                outerContainer
                            );
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
                                    (l) => l.id !== layout.id
                                );
                            await this.plugin.saveSettings();

                            this.generateLayouts(outerContainer);
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
        setTimeout(() => this.showSearchResults(additional, ""));
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
            const content = new Setting(additional).setName(item.name);
            let desc: string,
                needTooltip = false;
            if (Array.isArray(item.source)) {
                let source = item.source.slice(0, 4);
                if (item.source.length > 4) {
                    source.push(`and ${item.source.length - 4} more`);
                    needTooltip = true;
                }
                desc = stringify(source, 0, ", ", false);
            } else {
                desc = item.source;
            }
            content.setDesc(desc);
            if (needTooltip) {
                content.descEl.setAttr(
                    "aria-label",
                    stringify(item.source, 0, ", ", false)
                );
            }
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
                            modal.onClose = () => {
                                this.showSearchResults(additional, search);
                            };
                        });
                })
                .addExtraButton((b) => {
                    b.setIcon("trash")
                        .setTooltip("Delete")
                        .onClick(async () => {
                            await this.plugin.deleteMonster(item.name);
                            this.showSearchResults(additional, search);
                        });
                });
        }
        this.setFilterDesc();
    }
    displayed: Set<string> = new Set(this.plugin.sources);
    performFuzzySearch(input: string) {
        const results: Monster[] = [];
        for (const resource of this.plugin.sorted) {
            if (!resource.name && !resource.source) continue;
            if (
                typeof resource.source == "string" &&
                !this.displayed.has(resource.source)
            )
                continue;
            if (
                Array.isArray(resource.source) &&
                !resource.source.find((s) => this.displayed.has(s))
            )
                continue;

            const search = prepareSimpleSearch(input);
            let result = search(resource.name);
            if (!result && resource.source != null) {
                result = search(stringify(resource.source));
            }
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
            blocks: [],
            id: nanoid()
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
async function confirm(plugin: StatBlockPlugin): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            const modal = new ConfirmImport(plugin);
            modal.onClose = () => {
                resolve(modal.confirmed);
            };
            modal.open();
        } catch (e) {
            reject();
        }
    });
}
class ConfirmImport extends Modal {
    confirmed: boolean = false;
    constructor(public plugin: StatBlockPlugin) {
        super(plugin.app);
    }
    async display() {
        this.contentEl.empty();
        this.contentEl.addClass("confirm-modal");
        this.contentEl.createEl("p", {
            text: "This Layout includes JavaScript blocks. JavaScript blocks can execute code in your vault, which could cause loss or corruption of data."
        });
        this.contentEl.createEl("p", {
            text: "Are you sure you want to import this layout?"
        });

        const buttonContainerEl = this.contentEl.createDiv(
            "confirm-buttons-container"
        );
        buttonContainerEl.createEl("a").createEl("small", {
            cls: "dont-ask",
            text: "Import and don't ask again"
        }).onclick = async () => {
            this.confirmed = true;
            this.plugin.settings.alwaysImport = true;
            this.close();
        };

        const buttonEl = buttonContainerEl.createDiv("confirm-buttons");
        new ButtonComponent(buttonEl)
            .setButtonText("Import")
            .setCta()
            .onClick(() => {
                this.confirmed = true;
                this.close();
            });
        buttonEl.createEl("a").createEl("small", {
            cls: "dont-ask",
            text: "Cancel"
        }).onclick = () => {
            this.close();
        };
    }
    onOpen() {
        this.display();
    }
}
