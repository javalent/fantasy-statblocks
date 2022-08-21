import {
    EditorSuggest,
    type EditorSuggestContext,
    type EditorPosition,
    type Editor,
    type TFile,
    type EditorSuggestTriggerInfo
} from "obsidian";
import type StatBlockPlugin from "src/main";

export class StatblockSuggester extends EditorSuggest<string> {
    constructor(public plugin: StatBlockPlugin) {
        super(plugin.app);
    }
    getSuggestions(ctx: EditorSuggestContext) {
        return this.plugin
            .getBestiaryNames()
            .filter((p) => p.toLowerCase().contains(ctx.query.toLowerCase()));
    }
    renderSuggestion(text: string, el: HTMLElement) {
        el.createSpan({ text });
    }
    selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
        if (!this.context) return;

        const line = this.context.editor
            .getLine(this.context.end.line)
            .slice(this.context.end.ch);
        const [_, exists] = line.match(/^(\] ?)/) ?? [];

        this.context.editor.replaceRange(
            `${value}`,
            this.context.start,
            {
                ...this.context.end,
                ch:
                    this.context.start.ch +
                    this.context.query.length +
                    (exists?.length ?? 0)
            },
            "statblocks"
        );

        this.context.editor.setCursor(
            this.context.start.line,
            this.context.start.ch + value.length
        );

        this.close();
    }
    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        file: TFile
    ): EditorSuggestTriggerInfo {
        const range = editor.getRange({ line: 0, ch: 0 }, cursor);

        if (range.indexOf("```statblock\n") === -1) return;

        const split = range.split("\n").reverse();

        let inStatblock = false;
        for (const line of split) {
            if (/^```$/.test(line)) return;
            if (/^```statblock/.test(line)) {
                inStatblock = true;
                break;
            }
        }
        if (!inStatblock) return;

        const line = editor.getLine(cursor.line);
        //not inside the bracket

        if (!/^(monster|creature):/m.test(line.slice(0, cursor.ch)))
            return null;

        const match = line.match(/^(monster|creature): (.+)\n?/);
        if (!match) return null;

        const [_, param, query] = match;

        if (
            !query ||
            this.plugin
                .getBestiaryNames()
                .find((p) => p.toLowerCase() == query.toLowerCase())
        ) {
            return null;
        }
        const matchData = {
            end: cursor,
            start: {
                ch: param.length + 2,
                line: cursor.line
            },
            query
        };
        return matchData;
    }
}
