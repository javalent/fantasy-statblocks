import type StatBlockPlugin from "src/main";
import type { Monster } from "../../index";
import { SuggestionModal } from "./generic_suggester";
import type { FuzzyMatch } from "obsidian";

export class MonsterSuggestionModal extends SuggestionModal<Monster> {
    creature: Partial<Monster>;
    constructor(public plugin: StatBlockPlugin, inputEl: HTMLInputElement) {
        super(plugin.app, inputEl, [...plugin.bestiary.values()]);
        /* this.onInputChanged(); */
    }
    getItems() {
        return this.items;
    }
    getItemText(item: Monster) {
        return item.name;
    }
    onChooseItem(item: Monster) {
        this.inputEl.value = item.name;
        this.creature = this.plugin.getCreatureFromBestiary(item.name);
        this.onClose();
        this.close();
    }
    selectSuggestion({ item }: FuzzyMatch<Monster>) {
        this.inputEl.value = item.name;
        this.creature = this.plugin.getCreatureFromBestiary(item.name);
        this.onClose();
        this.close();
    }
    renderSuggestion(result: FuzzyMatch<Monster>, el: HTMLElement) {
        let { item, match: matches } = result || {};
        el.addClasses(["mod-complex"]);
        let content = el.createDiv({
            cls: "suggestion-content"
        });
        let name = content.createDiv("name");

        if (!item) {
            this.suggester.selectedItem = null;
            name.setText(this.emptyStateText);
            content.parentElement.addClass("is-selected");
            return;
        }

        const matchElements = matches.matches.map((m) => {
            return createSpan("suggestion-highlight");
        });
        for (let i = 0; i < item.name.length; i++) {
            let match = matches.matches.find((m) => m[0] === i);
            if (match) {
                let element = matchElements[matches.matches.indexOf(match)];
                name.appendChild(element);
                element.appendText(item.name.substring(match[0], match[1]));

                i += match[1] - match[0] - 1;
                continue;
            }

            name.appendText(item.name[i]);
        }
        content.createDiv({
            cls: "suggestion-note",
            text: [item.source].flat().join(", ")
        });
    }
}
