import { StatblockMonsterPlugin } from "@types";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { DnDAppFilesImporter } from "src/importers/DnDAppFilesImporter";

export default class StatblockSettingTab extends PluginSettingTab {
    constructor(app: App, private plugin: StatblockMonsterPlugin) {
        super(app, plugin);
    }

    async display(): Promise<void> {
        try {
            let { containerEl } = this;

            containerEl.empty();

            containerEl.createEl("h2", { text: "5e Statblock Settings" });

            const importAppFile = new Setting(containerEl)
                .setName("Import DnDAppFile")
                .setDesc("Only import content that you own.");
            const input = createEl("input", {
                attr: {
                    type: "file",
                    name: "dndappfile",
                    accept: ".xml"
                }
            });

            input.onchange = async () => {
                const { files } = input;
                if (!files.length) return;
                try {
                    const importer = new DnDAppFilesImporter();
                    const importedMonsters =
                        await importer.ImportEntitiesFromXml(
                            ...Array.from(files)
                        );
                    try {
                        await this.plugin.saveMonsters(importedMonsters);
                        new Notice(
                            `Successfully imported ${importedMonsters.length} monsters.`
                        );
                        console.log(
                            "🚀 ~ file: settings.ts ~ line 46 ~ StatblockSettingTab ~ input.onchange= ~ importedMonsters",
                            importedMonsters
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
                b.setButtonText("Choose File").setTooltip("Import DnDAppFile");
                b.buttonEl.addClass("statblock-file-upload");
                b.buttonEl.appendChild(input);
                b.onClick(() => input.click());
            });

            const additionalContainer = containerEl.createDiv(
                "statblock-additional-container"
            );
            new Setting(additionalContainer)
                .setName("Homebrew Monsters")
                .setDesc("Manage saved homebrew monsters.");
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
            //TODO: MEMOIZE THE SORT
            for (let monster of this.plugin.sorted) {
                let setting = new Setting(additional)
                    .setName(monster)
                    .setDesc(this.plugin.data.get(monster).source ?? "");

                setting.addExtraButton((b) => {
                    b.setIcon("trash")
                        .setTooltip("Delete")
                        .onClick(async () => {
                            try {
                                await this.plugin.deleteMonster(monster);
                            } catch (e) {
                                new Notice(
                                    `There was an error deleting the monster:${
                                        `\n\n` + e.message
                                    }`
                                );
                            }
                            this.display();
                        });
                });
            }
        } catch (e) {
            new Notice(
                "There was an error displaying the settings tab for 5e Statblocks."
            );
        }
    }
}
