import { StatblockMonsterPlugin } from "@types";
import {
    App,
    Notice,
    PluginSettingTab,
    Setting,
    TextComponent
} from "obsidian";
import {
    ImportEntitiesFromXml,
    ImportEntitiesFromImprovedInitiative,
    ImportFrom5eTools,
    ImportFromCritterDB
} from "src/importers";
import { MonsterSuggester } from "src/util/suggester";

export default class StatblockSettingTab extends PluginSettingTab {
    constructor(app: App, private plugin: StatblockMonsterPlugin) {
        super(app, plugin);
    }

    async display(): Promise<void> {
        try {
            let { containerEl } = this;

            containerEl.empty();

            containerEl.createEl("h2", { text: "5e Statblock Settings" });

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
                    accept: ".xml"
                }
            });

            inputAppFile.onchange = async () => {
                const { files } = inputAppFile;
                if (!files.length) return;
                try {
                    const importedMonsters = await ImportEntitiesFromXml(
                        ...Array.from(files)
                    );
                    try {
                        await this.plugin.saveMonsters(
                            Array.from(importedMonsters.values())
                        );
                        new Notice(
                            `Successfully imported ${importedMonsters.size} monsters.`
                        );
                    } catch (e) {
                        new Notice(
                            `There was an issue importing the file${
                                files.length > 1 ? "s" : ""
                            }.`
                        );
                    }
                    this.display();
                } catch (e) {}
            };

            importAppFile.addButton((b) => {
                b.setButtonText("Choose File").setTooltip(
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
                    accept: ".json"
                }
            });

            inputImprovedInitiative.onchange = async () => {
                const { files } = inputImprovedInitiative;
                if (!files.length) return;
                try {
                    const importedMonsters =
                        await ImportEntitiesFromImprovedInitiative(
                            ...Array.from(files)
                        );

                    try {
                        await this.plugin.saveMonsters(
                            Array.from(importedMonsters.values())
                        );
                        new Notice(
                            `Successfully imported ${importedMonsters.size} monsters.`
                        );
                    } catch (e) {
                        new Notice(
                            `There was an issue importing the file${
                                files.length > 1 ? "s" : ""
                            }.`
                        );
                    }
                    this.display();
                } catch (e) {}
            };

            importImprovedInitiative.addButton((b) => {
                b.setButtonText("Choose File").setTooltip(
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
                    accept: ".json"
                }
            });

            inputCritterDB.onchange = async () => {
                const { files } = inputCritterDB;
                if (!files.length) return;
                try {
                    const importedMonsters = await ImportFromCritterDB(
                        ...Array.from(files)
                    );

                    try {
                        await this.plugin.saveMonsters(
                            Array.from(importedMonsters.values())
                        );
                        new Notice(
                            `Successfully imported ${importedMonsters.size} monsters.`
                        );
                    } catch (e) {
                        new Notice(
                            `There was an issue importing the file${
                                files.length > 1 ? "s" : ""
                            }.`
                        );
                    }
                    this.display();
                } catch (e) {}
            };

            importCritterDB.addButton((b) => {
                b.setButtonText("Choose File").setTooltip(
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
                    accept: ".json"
                }
            });

            input5eTools.onchange = async () => {
                const { files } = input5eTools;
                if (!files.length) return;
                try {
                    const importedMonsters = await ImportFrom5eTools(
                        ...Array.from(files)
                    );

                    try {
                        await this.plugin.saveMonsters(
                            Array.from(importedMonsters.values())
                        );
                        new Notice(
                            `Successfully imported ${importedMonsters.size} monsters.`
                        );
                    } catch (e) {
                        new Notice(
                            `There was an issue importing the file${
                                files.length > 1 ? "s" : ""
                            }.`
                        );
                    }
                    this.display();
                } catch (e) {}
            };

            import5eTools.addButton((b) => {
                b.setButtonText("Choose File").setTooltip(
                    "Import 5e.tools Data"
                );
                b.buttonEl.addClass("statblock-file-upload");
                b.buttonEl.appendChild(input5eTools);
                b.onClick(() => input5eTools.click());
            });

            const additionalContainer = containerEl.createDiv(
                "statblock-additional-container statblock-monsters"
            );
            let monsterFilter: TextComponent;
            const filters = additionalContainer.createDiv(
                "statblock-monster-filter"
            );
            const searchMonsters = new Setting(filters)
                .setName("Homebrew Monsters")
                .addSearch((t) => {
                    t.setPlaceholder("Filter Monsters");
                    monsterFilter = t;
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

            searchMonsters.setDesc(
                `Manage homebrew monsters. Currently: ${
                    suggester.getItems().length
                } monsters.`
            );

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
                this.display();
            };
            suggester.onInputChanged = () =>
                searchMonsters.setDesc(
                    `Manage homebrew monsters. Currently: ${suggester.filteredItems.length} monsters.`
                );
        } catch (e) {
            new Notice(
                "There was an error displaying the settings tab for 5e Statblocks."
            );
        }
    }
}
