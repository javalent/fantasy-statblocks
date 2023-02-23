<script lang="ts">
    import { EditorView } from "@codemirror/view";
    import { EditorState } from "@codemirror/state";
    import type { IfElseCondition } from "src/layouts/types";
    import { basicSetup } from "../editor/extensions";
    import { materialPalenight } from "../editor/theme-dark";
    import { basicLightTheme } from "../editor/theme-light";
    import { ExtraButtonComponent, setIcon, TextAreaComponent } from "obsidian";
    import { createEventDispatcher, onDestroy } from "svelte";

    const dispatch = createEventDispatcher();
    export let condition: IfElseCondition;
    export let editing: boolean = false;
    let editor: EditorView;
    function complete() {
        if (editor) {
            condition.condition = editor.state.doc.toString();
            editor.destroy();
        }
        dispatch("done");
    }
    function editorFromTextArea(textarea: HTMLTextAreaElement) {
        if (document.body.hasClass("theme-dark")) {
            basicSetup.push(materialPalenight);
        } else {
            basicSetup.push(basicLightTheme);
        }
        let view = new EditorView({
            state: EditorState.create({
                doc: textarea.value,
                extensions: basicSetup
            })
        });
        textarea.parentNode!.insertBefore(view.dom, textarea);
        textarea.style.display = "none";
        if (textarea.form)
            textarea.form.addEventListener("submit", () => {
                textarea.value = view.state.doc.toString();
            });
        return view;
    }
    const textarea = (node: HTMLElement) => {
        const textarea = new TextAreaComponent(node).setValue(
            condition?.condition ? condition.condition : ""
        );
        editor = editorFromTextArea(textarea.inputEl);
    };
    const warning = (node: HTMLElement) => {
        setIcon(node, "alert-triangle");
    };
    const editIcon = (node: HTMLElement) => {
        new ExtraButtonComponent(node).setIcon("pencil");
    };
    const finishIcon = (node: HTMLElement) => {
        new ExtraButtonComponent(node).setIcon("check");
    };
    const trashIcon = (node: HTMLElement) => {
        new ExtraButtonComponent(node).setIcon("trash");
    };

    onDestroy(() => {
        editor?.destroy();
    });
</script>

<div class="setting-item-info">
    {#if editing}
        <div use:textarea />
    {:else}
        <div class="setting-item-name">
            {#if !condition || !condition.condition}
                <div use:warning />
                <em>No condition set</em>
            {:else}
                <code>
                    {condition.condition}
                </code>
            {/if}
        </div>
    {/if}
</div>

<div class="setting-item-control">
    {#if editing}
        <div class="done" on:click={complete} use:finishIcon />
    {:else}
        <div class="edit" on:click={() => dispatch("edit")} use:editIcon />
    {/if}
    <div class="delete" on:click={() => dispatch("delete")} use:trashIcon />
</div>

<style scoped>
    .setting-item-info {
        width: 100%;
    }
    .setting-item-name {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
</style>
