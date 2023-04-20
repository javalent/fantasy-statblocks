import type { Monster } from "types";
import { Modal, Notice } from "obsidian";
import type StatBlockPlugin from "src/main";

import EditMonsterApp from "./EditMonster.svelte";

export class EditMonsterModal extends Modal {
    private _instance: EditMonsterApp;
    constructor(
        private plugin: StatBlockPlugin,
        private monster: Partial<Monster> = {}
    ) {
        super(plugin.app);
    }

    onOpen() {
        this._instance = new EditMonsterApp({
            target: this.contentEl,
            props: {
                monster: this.monster
            }
        });
        this._instance.$on("cancel", () => {
            this.close();
        });
        this._instance.$on("save", async ({ detail }: { detail: Monster }) => {
            if (!detail.name) {
                new Notice("Creatures must be given a name.");
                return;
            }
            await this.plugin.updateMonster(this.monster as Monster, detail);
            this.close();
        });
    }
    onClose() {}
    close() {
        if (this._instance) this._instance.$destroy();
        super.close();
    }
}
