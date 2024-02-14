import { TextAreaComponent, setIcon } from "obsidian";
import { editorFromTextArea } from "./util";
import { EditorView } from "@codemirror/view";

export const setNodeIcon = (node: HTMLElement, icon: string) => {
    setIcon(node, icon);
};

export function buildTextArea(
    containerEl: HTMLElement,
    initialValue: string,
    extraClasses: string[],
    cb: (value: string) => void,
    lang: "js" | "yaml" = "js"
) {
    const editor = new TextAreaComponent(containerEl).setValue(initialValue);
    editor.inputEl.addClasses(["statblock-textarea", ...extraClasses]);
    return editorFromTextArea(
        editor.inputEl,
        EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                cb(update.state.doc.toString());
            }
        }),
        lang
    );
}
