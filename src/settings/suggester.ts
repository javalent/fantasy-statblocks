import { Command, FuzzyMatch, Setting, TextComponent } from "obsidian";
import { SuggestionModal } from "src/util/generic_suggester";

export class CommandSuggester extends SuggestionModal<Command> {
    text: TextComponent;
    constructor(input: TextComponent, public commands: Command[]) {
        super(app, input.inputEl, commands);
        this.text = input;
        this.inputEl.addEventListener("input", this.getItem.bind(this));
    }
    getItem() {
        const v = this.inputEl.value,
            command = this.getItems().find((c) => c.name === v.trim());
        if (command == this.item) return;
        this.item = command;
        this.onInputChanged();
    }
    getItemText(item: Command) {
        return item.name;
    }
    onChooseItem(item: Command) {
        this.text.setValue(item.name);
        this.item = item;
    }
    selectSuggestion({ item }: FuzzyMatch<Command>) {
        let link = item.name;
        this.item = item;
        this.text.setValue(link);
        this.onClose();

        this.close();
    }
    renderSuggestion(result: FuzzyMatch<Command>, el: HTMLElement) {
        let { item, match: matches } = result || {};
        let content = new Setting(el);
        if (!item) {
            content.nameEl.setText(this.emptyStateText);
            return;
        }

        for (let i = 0; i < item.name.length; i++) {
            let match = matches.matches.find((m) => m[0] === i);
            if (match) {
                content.nameEl.createSpan({
                    cls: "suggestion-highlight",
                    text: item.name.substring(match[0], match[1])
                });

                i += match[1] - match[0] - 1;
                continue;
            }

            content.nameEl.appendText(item.name[i]);
        }

        /* content.setDesc(item.source); */
    }
    getItems() {
        return this.commands;
    }
    onClose(item?: Command) {}
    onRemoveItem(item: Command) {}
}
export class IconSuggester extends SuggestionModal<string> {
    text: TextComponent;
    constructor(input: TextComponent, public icons: string[]) {
        super(app, input.inputEl, icons);
        this.text = input;

        this.inputEl.addEventListener("input", this.getItem.bind(this));
    }
    getItem() {
        const v = this.inputEl.value,
            command = this.getItems().find((c) => c === v.trim());
        if (command == this.item) return;
        this.item = command;
        this.onInputChanged();
    }
    getItemText(item: string) {
        return item;
    }
    onChooseItem(item: string) {
        this.text.setValue(item);
        this.item = item;
    }
    selectSuggestion({ item }: FuzzyMatch<string>) {
        let link = item;

        this.text.setValue(link);
        this.onClose();

        this.close();
    }
    renderSuggestion(result: FuzzyMatch<string>, el: HTMLElement) {
        let { item, match: matches } = result || {};
        let content = new Setting(el);
        if (!item) {
            content.nameEl.setText(this.emptyStateText);
            return;
        }

        for (let i = 0; i < item.length; i++) {
            let match = matches.matches.find((m) => m[0] === i);
            if (match) {
                content.nameEl.createSpan({
                    cls: "suggestion-highlight",
                    text: item.substring(match[0], match[1])
                });

                i += match[1] - match[0] - 1;
                continue;
            }

            content.nameEl.appendText(item[i]);
        }

        /* content.setDesc(item.source); */
    }
    getItems() {
        return this.icons;
    }
    onClose(item?: Command) {}
    onRemoveItem(item: Command) {}
}
