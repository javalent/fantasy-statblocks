<script lang="ts">
    import { MarkdownRenderer, Notice } from "obsidian";
    import type { MarkdownableItem, StatblockItem } from "types/layout";
    import type StatBlockPlugin from "src/main";

    import { getContext } from "svelte";
    import type StatBlockRenderer from "../statblock";
    import type { Monster } from "index";

    export let property: string;
    property = property
        .replace(/<STATBLOCK-LINK>/g, "[[")
        .replace(/<\/STATBLOCK-LINK>/g, "]]");

    const context = getContext<string>("context");
    const renderer = getContext<StatBlockRenderer>("renderer");
    let item = getContext<MarkdownableItem>("item");
    let dice = getContext<boolean>("dice") && item.dice;
    let monster = getContext<Monster>("monster");
    let plugin = getContext<StatBlockPlugin>("plugin");

    let split: Array<{ text: string; original?: string } | string> = [property];
    if (dice) {
        if (
            item.diceProperty &&
            item.diceProperty in monster &&
            typeof monster[item.diceProperty] == "string"
        ) {
            split = [{ text: monster[item.diceProperty] as string }];
        } else if (item.diceCallback) {
            try {
                const frame = document.body.createEl("iframe");
                const funct = (frame.contentWindow as any).Function;
                const func = new funct(
                    "monster",
                    "property",
                    item.diceCallback
                );
                const parsed =
                    func.call(undefined, monster, property) ?? property;
                document.body.removeChild(frame);
                if (Array.isArray(parsed)) {
                    split = parsed;
                } else {
                    split = [parsed];
                }
            } catch (e) {
                new Notice(
                    `There was an error executing the provided dice callback for [${item.properties.join(
                        ", "
                    )}]\n\n${e.message}`
                );
                console.error(e);
            }
        } else {
            const parsed = plugin.parseForDice(property);
            if (Array.isArray(parsed)) {
                split = parsed;
            } else {
                split = [parsed];
            }
        }
    }
    let start = 0;

    for (const dice of split) {
        if (typeof dice != "string") {
            const replacer = dice.original ?? dice.text;
            let diceString;
            let diceText = plugin.getRollerString(dice.text);
            console.log(
                "🚀 ~ file: MarkdownHolder.svelte:71 ~ diceText:",
                diceText
            );
            if (dice.original) {
                diceString = `${dice.original} (\`dice: ${diceText}\`)`;
            } else {
                diceString = `\`dice: ${diceText}\``;
            }
            const index = property.slice(start).indexOf(replacer);
            property =
                property.slice(0, start) +
                property.slice(start).replace(replacer, diceString);

            start =
                property.slice(0, start).length + index + diceString.length + 1;
        } else {
            start += dice.length;
        }
    }

    const markdown = (node: HTMLElement) => {
        MarkdownRenderer.renderMarkdown(property, node, context, renderer);
    };
</script>

<div class="statblock-markdown" use:markdown />

<style>
    .statblock-markdown {
        display: inline;
    }
    .statblock-markdown :global(p) {
        display: inline;
    }
    .statblock-markdown :global(p ~ p) {
        display: inline-block;
    }
</style>
