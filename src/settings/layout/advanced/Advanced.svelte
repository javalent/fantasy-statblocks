<script lang="ts">
    import { Setting } from "obsidian";
    import type { DiceParsing, Layout } from "types/layout";
    import DropZone from "../Dropzone.svelte";
    import DiceParsingComponent from "./DiceParsing.svelte";
    import DiceParsingModal from "./modal";
    import { getContext } from "../context";

    const layout = getContext("layout");
    const plugin = getContext("plugin");
    if (!$layout.diceParsing) {
        $layout.diceParsing = [];
    }

    $: items = [...$layout.diceParsing];

    function onDrop(items: DiceParsing[]) {
        $layout.diceParsing = [...items];
    }

    const advanced = (item?: DiceParsing) => {
        const modal = new DiceParsingModal(plugin, item);
        modal.onClose = () => {
            if (!modal.saved) return;
            const existing = $layout.diceParsing.indexOf(item);

            if (existing === -1) {
                $layout.diceParsing.push(modal.item);
            } else {
                $layout.diceParsing.splice(existing, 1, modal.item);
            }
            $layout.diceParsing = $layout.diceParsing;
        };

        modal.open();
    };
    const trash = (evt: DiceParsing) => {
        items = items.filter((i) => i.id != evt.id);
    };

    const diceParsingLayout = (node: HTMLElement) => {
        new Setting(node)
            .setHeading()
            .setName("Dice Parsing")
            .setDesc(
                createFragment((e) => {
                    e.createSpan({ text: "Add " });
                    e.createEl("a", {
                        href: "https://regex101.com",
                        text: "regular expressions"
                    });
                    e.createSpan({
                        text: " to detect dice rolls inside your layout."
                    });
                    e.createEl("br");
                    e.createSpan({
                        text: "These are parsed in order, and the first one to trigger is what will be used."
                    });
                })
            )
            .addExtraButton((b) => {
                b.setIcon("plus-with-circle").onClick(() => {
                    advanced();
                });
            });
    };
</script>

<div use:diceParsingLayout />
<div class="dice-parsing statblock-additional-container">
    <div class="additional">
        {#key items}
            <DropZone
                type="dice"
                component={DiceParsingComponent}
                {items}
                {onDrop}
                on:advanced={(e) => advanced(e.detail)}
                on:trash={(e) => trash(e.detail)}
            />
        {/key}
    </div>
</div>

<style scoped>
</style>
