import type StatBlockPlugin from "src/main";
import type { Monster } from "../../index";
import { SuggestionModal } from "./generic_suggester";
import type { FuzzyMatch, SearchResult } from "obsidian";
import { stringify } from "./util";

export class MonsterSuggestionModal extends SuggestionModal<Monster> {
    creature: Partial<Monster>;
    field: keyof Monster = "name";
    constructor(public plugin: StatBlockPlugin, inputEl: HTMLInputElement) {
        super(plugin.app, inputEl, [...plugin.getBestiaryCreatures()]);
        /* this.onInputChanged(); */
    }
    getItems() {
        return this.items;
    }
    getItemText(item: Monster) {
        if (this.field) return stringify(item[this.field]) ?? "";
        return item.name;
    }
    modifyInput(input: string): string {
        if (/^@.+\s/.test(input)) {
            const [_, field] = input.match(/^@(.+?)\s/) ?? [];
            this.field = (field as keyof Monster) ?? "name";
        }
        return input.replace(/^@(.+?)\s/, "").trim();
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

        if (this.field === "name") {
            this.renderHighlights(item.name, matches, name);
        } else {
            name.appendText(item.name);
        }
        content.createDiv({
            cls: "suggestion-note",
            text: [item.source].flat().join(", ")
        });
        if (this.field != "name") {
            let fieldEl = content.createDiv({
                cls: "suggestion-note"
            });
            this.renderHighlights(
                stringify(item[this.field]),
                matches,
                fieldEl
            );
        }
    }
    renderHighlights(text: string, matches: SearchResult, el: HTMLElement) {
        const matchElements = matches.matches.map((m) => {
            return createSpan("suggestion-highlight");
        });
        for (let i = 0; i < text.length; i++) {
            let match = matches.matches.find((m) => m[0] === i);
            if (match) {
                let element = matchElements[matches.matches.indexOf(match)];
                el.appendChild(element);
                element.appendText(text.substring(match[0], match[1]));

                i += match[1] - match[0] - 1;
                continue;
            }

            el.appendText(text[i]);
        }
    }
}
