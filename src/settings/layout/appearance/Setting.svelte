<script lang="ts">
    import { ColorComponent, DropdownComponent, Setting } from "obsidian";
    import { DefaultProperties } from "src/settings/settings.constants";
    import { createEventDispatcher } from "svelte";
    import { getContext } from "../context";
    import type { LayoutCSSProperties } from "types/layout";
    import { derived } from "svelte/store";

    export let name: string;
    export let value: string;

    export let desc: string = "";

    const dispatch = createEventDispatcher<{ change: string }>();

    const setting = (node: HTMLElement) => {
        new Setting(node.parentElement)
            .setName(name)
            .setDesc(desc)
            .addColorPicker((c) => {
                c.setValue(value);
                c.onChange((v) => {
                    dispatch("change", v);
                });
            });
        node.detach();
    };
</script>

<div use:setting />
