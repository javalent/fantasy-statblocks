import { Monster, StatblockMonsterPlugin } from "@types";
import {
    App,
    FuzzyMatch,
    FuzzySuggestModal,
    Notice,
    Scope,
    Setting,
    SuggestModal,
    TextComponent
} from "obsidian";
/* import { createPopper, Instance as PopperInstance } from "@popperjs/core"; */

class Suggester<T> {
    owner: SuggestModal<T>;
    items: T[];
    suggestions: HTMLDivElement[];
    selectedItem: number;
    containerEl: HTMLElement;
    constructor(
        owner: SuggestModal<T>,
        containerEl: HTMLElement,
        scope: Scope
    ) {
        this.containerEl = containerEl;
        this.owner = owner;
        /* containerEl.on(
            "click",
            ".suggestion-item",
            this.onSuggestionClick.bind(this)
        ); */
        /* containerEl.on(
            "mousemove",
            ".suggestion-item",
            this.onSuggestionMouseover.bind(this)
        ); */

        scope.register([], "ArrowUp", () => {
            this.setSelectedItem(this.selectedItem - 1, true);
            return false;
        });

        scope.register([], "ArrowDown", () => {
            this.setSelectedItem(this.selectedItem + 1, true);
            return false;
        });

        scope.register([], "Enter", (evt) => {
            this.useSelectedItem(evt);
            return false;
        });

        scope.register([], "Tab", (evt) => {
            this.chooseSuggestion(evt);
            return false;
        });
    }
    chooseSuggestion(evt: KeyboardEvent) {
        if (!this.items || !this.items.length) return;
        const currentValue = this.items[this.selectedItem];
        if (currentValue) {
            this.owner.onChooseSuggestion(currentValue, evt);
        }
    }
    onSuggestionClick(event: MouseEvent, el: HTMLDivElement): void {
        event.preventDefault();
        if (!this.suggestions || !this.suggestions.length) return;

        const item = this.suggestions.indexOf(el);
        this.setSelectedItem(item, false);
        this.useSelectedItem(event);
    }

    onSuggestionMouseover(event: MouseEvent, el: HTMLDivElement): void {
        if (!this.suggestions || !this.suggestions.length) return;
        const item = this.suggestions.indexOf(el);
        this.setSelectedItem(item, false);
    }
    empty() {
        this.containerEl.empty();
    }
    setSuggestions(items: T[]) {
        this.containerEl.empty();
        const els: HTMLDivElement[] = [];

        items.forEach((item) => {
            const suggestionEl =
                this.containerEl.createDiv(/* "suggestion-item" */);
            this.owner.renderSuggestion(item, suggestionEl);
            els.push(suggestionEl);
        });
        this.items = items;
        this.suggestions = els;
        this.setSelectedItem(0, false);
    }
    useSelectedItem(event: MouseEvent | KeyboardEvent) {
        if (!this.items || !this.items.length) return;
        const currentValue = this.items[this.selectedItem];
        if (currentValue) {
            this.owner.selectSuggestion(currentValue, event);
        }
    }
    wrap(value: number, size: number): number {
        return ((value % size) + size) % size;
    }
    setSelectedItem(index: number, scroll: boolean) {
        const nIndex = this.wrap(index, this.suggestions.length);
        const prev = this.suggestions[this.selectedItem];
        const next = this.suggestions[nIndex];

        /*         if (prev) prev.removeClass("is-selected");
        if (next) next.addClass("is-selected"); */

        this.selectedItem = nIndex;

        if (scroll) {
            next.scrollIntoView(false);
        }
    }
}

abstract class SuggestionModal<T> extends FuzzySuggestModal<T> {
    items: T[] = [];
    suggestions: HTMLDivElement[];
    scope: Scope = new Scope();
    suggester: Suggester<FuzzyMatch<T>>;
    suggestEl: HTMLDivElement;
    promptEl: HTMLDivElement;
    emptyStateText: string = "No match found";
    limit: number = 100;
    filteredItems: FuzzyMatch<T>[] = [];
    constructor(
        app: App,
        inputEl: HTMLInputElement,
        suggestEl: HTMLDivElement,
        items: T[]
    ) {
        super(app);
        this.inputEl = inputEl;
        this.items = items;

        this.suggestEl = suggestEl.createDiv(/* "suggestion-container" */);

        this.contentEl = this.suggestEl.createDiv(/* "suggestion" */);

        this.suggester = new Suggester(this, this.contentEl, this.scope);

        this.scope.register([], "Escape", this.close.bind(this));

        this.inputEl.addEventListener("input", this._onInputChanged.bind(this));
        this.inputEl.addEventListener("focus", this._onInputChanged.bind(this));
        this.inputEl.addEventListener("blur", this.close.bind(this));
        this.suggestEl.on(
            "mousedown",
            ".suggestion-container",
            (event: MouseEvent) => {
                event.preventDefault();
            }
        );
    }
    empty() {
        this.suggester.empty();
    }
    _onInputChanged(): void {
        const inputStr = this.inputEl.value;
        this.filteredItems = this.getSuggestions(inputStr);
        if (this.filteredItems.length > 0) {
            this.suggester.setSuggestions(
                this.filteredItems.slice(0, this.limit)
            );
        } else {
            this.onNoSuggestion();
        }
        this.onInputChanged();
        this.open();
    }
    onInputChanged(): void {}
    onNoSuggestion() {
        this.empty();
        this.renderSuggestion(
            null,
            this.contentEl.createDiv(/* "suggestion-item" */)
        );
    }
    open(): void {}

    close(): void {
        this.suggester.setSuggestions([]);
    }
    createPrompt(prompts: HTMLSpanElement[]) {
        if (!this.promptEl)
            this.promptEl = this.suggestEl.createDiv("prompt-instructions");
        let prompt = this.promptEl.createDiv("prompt-instruction");
        for (let p of prompts) {
            prompt.appendChild(p);
        }
    }
    abstract onChooseItem(item: T, evt: MouseEvent | KeyboardEvent): void;
    abstract getItemText(arg: T): string;
    abstract getItems(): T[];
}

export class MonsterSuggester extends SuggestionModal<Monster> {
    monsters: Monster[];
    monster: Monster;
    text: TextComponent;
    constructor(
        public plugin: StatblockMonsterPlugin,
        input: TextComponent,
        el: HTMLDivElement,
        items: Monster[]
    ) {
        super(plugin.app, input.inputEl, el, items);
        this.monsters = [...items];
        this.text = input;
        //this.getItem();
        this._onInputChanged();
        this.createPrompts();

        this.inputEl.addEventListener("input", this.getItem.bind(this));
    }
    createPrompts() {}
    getItem() {
        const v = this.inputEl.value,
            monster = this.monsters.find(
                (c) => c.name === v.trim() /* || c.source === v.trim() */
            );
        if (monster == this.monster) return;
        this.monster = monster;
        if (this.monster)
            /* this.cache = this.app.metadataCache.getFileCache(this.command); */
            this._onInputChanged();
    }
    getItemText(item: Monster) {
        return item.name /* + item.source */;
    }
    onChooseItem() {}
    selectSuggestion() {}
    renderSuggestion(result: FuzzyMatch<Monster>, el: HTMLElement) {
        let { item, match: matches } = result || {};
        let content = new Setting(el); /* el.createDiv({
            cls: "suggestion-content"
        }); */
        if (!item) {
            content.nameEl.setText(this.emptyStateText);
            /* content.parentElement.addClass("is-selected"); */
            return;
        }

        const matchElements = matches.matches.map((m) => {
            return createSpan("suggestion-highlight");
        });
        for (let i = 0; i < item.name.length; i++) {
            let match = matches.matches.find((m) => m[0] === i);
            if (match) {
                let element = matchElements[matches.matches.indexOf(match)];
                content.nameEl.appendChild(element);
                element.appendText(item.name.substring(match[0], match[1]));

                i += match[1] - match[0] - 1;
                continue;
            }

            content.nameEl.appendText(item.name[i]);
        }
        
        content.setDesc(item.source);
        content.addExtraButton((b) => {
            b.setIcon("trash")
                .setTooltip("Delete")
                .onClick(() => this.onRemoveItem(item));
        });
    }
    getItems() {
        return this.monsters;
    }
    onClose(item?: Monster) {}
    onRemoveItem(item: Monster) {}
}
