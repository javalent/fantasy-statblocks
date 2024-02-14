<script lang="ts">
    import { getContext } from "../context";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import {
        SearchComponent,
        debounce,
        parseYaml,
        stringifyYaml
    } from "obsidian";
    import { MonsterSuggestionModal } from "src/util/creature";
    import type { Monster } from "index";
    import { buildTextArea } from "src/util";
    import type { EditorView } from "@codemirror/view";
    import StatBlockRenderer from "src/view/statblock";

    export let previewed: string;

    const plugin = getContext("plugin");
    const layout = getContext("layout");
    const dispatch = createEventDispatcher<{ update: string }>();

    const preview = (container: HTMLElement, monster: Monster) => {
        container.empty();
        renderer.setCreature({ monster });
        renderer.init();
    };
    let previewContainer: HTMLDivElement, renderer: StatBlockRenderer;

    onMount(() => {
        let monster: Monster = {} as Monster;
        try {
            monster = { ...monster, ...parseYaml(previewed) };
        } catch (e) {}
        renderer = new StatBlockRenderer(
            {
                plugin,
                container: previewContainer,
                layout: $layout,
                monster
            },
            false
        );
    });
    const search = (node: HTMLElement) => {
        const search = new SearchComponent(node).setPlaceholder(
            "Find a creature"
        );
        const suggester = new MonsterSuggestionModal(plugin, search.inputEl);
        suggester.onClose = async () => {
            if (suggester.creature) {
                search.setValue("");
                const text = stringifyYaml(suggester.creature);
                dispatch("update", text);
                editor.dispatch({
                    changes: [
                        {
                            from: 0,
                            to: editor.state.doc.length,
                            insert: text
                        }
                    ]
                });
            }
        };
    };

    let editor: EditorView;
    const yaml = (node: HTMLElement) => {
        editor = buildTextArea(
            node,
            previewed,
            [],
            debounce((v) => {
                try {
                    const creature = parseYaml(v) as Monster;
                    dispatch("update", v);
                    preview(previewContainer, creature);
                } catch (e) {}
            }, 500)
        );
    };

    onDestroy(() => {
        if (editor) editor.destroy();
    });
</script>

<div class="previewer">
    <div>
        Select a creature to preview the layout, or enter your own definition
        below.
    </div>

    <div class="preview">
        <div class="preview-container inner" bind:this={previewContainer} />
    </div>

    <div class="definition">
        <div use:search />
        <div class="yaml-editor" use:yaml />
    </div>
</div>

<style>
    .previewer {
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 0.5rem;
    }
    .preview {
        overflow: hidden;
        position: relative;
    }
    .inner {
        overflow: auto;
        padding: var(--size-4-4);
        scale: 0.625;
        position: absolute;
        top: -30%;
        left: -30%;
        height: 160%;
        width: 160%;
    }
    .definition {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.25rem;
    }
    .yaml-editor {
        font-size: var(--font-smallest);
    }
</style>
