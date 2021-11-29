<script lang="ts">
    import type { Monster, Trait } from "@types";
    import type { StatblockItem } from "src/data/constants";
    import type StatblockPlugin from "src/main";
    import PropertyBlock from "./PropertyBlock.svelte";
    import Spells from "./Spells.svelte";
    import Heading from "./Heading.svelte";
    import PropertyLine from "./PropertyLine.svelte";
    import Rule from "./Rule.svelte";
    import Saves from "./Saves.svelte";
    import SectionHeading from "./SectionHeading.svelte";
    import Subheading from "./Subheading.svelte";
    import Table from "./Table.svelte";
    import { getContext, onMount, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let monster: Monster;
    export let statblock: StatblockItem[];
    export let columns: number = 1;
    export let ready: boolean;
    export let canExport: boolean;
    export let canSave: boolean;

    const checkConditioned = (item: StatblockItem) => {
        if (!item.conditioned) return true;
        if (!item.properties.length) return true;
        return item.properties.some((prop) => {
            if (prop in monster) {
                if (
                    Array.isArray(monster[prop]) &&
                    (monster[prop] as Array<any>).length
                ) {
                    return true;
                }
                if (
                    typeof monster[prop] === "string" &&
                    (monster[prop] as string).length
                ) {
                    return true;
                }
                if (typeof monster[prop] === "number") {
                    return true;
                }
            }
            return false;
        });
    };

    const plugin = getContext<StatblockPlugin>("plugin");

    const getElementForStatblockItem = (
        item: StatblockItem,
        container?: HTMLDivElement
    ): HTMLDivElement[] => {
        const targets: HTMLDivElement[] = [];
        const target = container ?? createDiv("statblock-item-container");

        if (!checkConditioned(item)) {
            return [];
        }
        targets.push(target);
        switch (item.type) {
            case "heading": {
                const heading = new Heading({
                    target,
                    props: {
                        monster,
                        item,
                        canSave,
                        canExport
                    },
                    context: new Map([["plugin", plugin]])
                });
                heading.$on("save", (e) => dispatch("save", e.detail));
                heading.$on("export", (e) => dispatch("export", e.detail));
                break;
            }
            case "property": {
                new PropertyLine({
                    target,
                    props: {
                        monster,
                        item
                    },
                    context: new Map([["plugin", plugin]])
                });
                break;
            }
            case "saves": {
                new Saves({
                    target,
                    props: {
                        monster,
                        item
                    },
                    context: new Map([["plugin", plugin]])
                });
                break;
            }
            case "section": {
                const blocks: Trait[] = monster[item.properties[0]] as Trait[];
                if (!Array.isArray(blocks) || !blocks.length) return [];

                if (item.heading) {
                    new SectionHeading({
                        target,
                        props: {
                            header: item.heading
                        },
                        context: new Map([["plugin", plugin]])
                    });
                }
                try {
                    for (const block of blocks) {
                        const prop = target.createDiv(
                            "statblock-item-container"
                        );
                        new PropertyBlock({
                            target: prop,
                            props: {
                                name: block.name,
                                desc: block.desc,
                                dice: item.dice && item.dice.parse
                            },
                            context: new Map([["plugin", plugin]])
                        });
                        targets.push(prop);
                    }
                } catch (e) {
                    return [];
                }
                break;
            }
            case "spells": {
                const blocks: Trait[] = monster[item.properties[0]] as Trait[];
                if (!Array.isArray(blocks) || !blocks.length) return;

                new Spells({
                    target,
                    props: {
                        monster
                    },
                    context: new Map([["plugin", plugin]])
                });
                break;
            }
            case "subheading": {
                new Subheading({
                    target,
                    props: {
                        monster,
                        item
                    },
                    context: new Map([["plugin", plugin]])
                });
                break;
            }
            case "table": {
                new Table({
                    target,
                    props: {
                        monster,
                        item
                    },
                    context: new Map([["plugin", plugin]])
                });
                break;
            }
            case "inline": {
                const inline = target.createDiv("statblock-item-inline");
                for (const nested of item.nested ?? []) {
                    getElementForStatblockItem(nested, inline);
                }
                break;
            }
            case "group": {
                for (const nested of item.nested ?? []) {
                    targets.push(...getElementForStatblockItem(nested));
                }

                break;
            }
        }
        if (item.hasRule) {
            const rule = createDiv("statblock-item-container");
            new Rule({
                target: rule
            });
            targets.push(rule);
        }
        return targets;
    };

    const buildStatblock = (node: HTMLElement) => {
        node.empty();
        let columnEl = node.createDiv("column");
        const targets: HTMLElement[] = [];

        for (let item of statblock) {
            targets.push(...getElementForStatblockItem(item));
        }

        const temp = document.body.createDiv("statblock-detached");
        targets.forEach((b) => {
            temp.appendChild(b.cloneNode(true));
        }, 0);
        const splitHeight = Math.max(temp.clientHeight, 500);

        temp.detach();
        if (columns == 1) {
            targets.forEach((el) => columnEl.appendChild(el));
            return;
        }

        for (let target of targets) {
            columnEl.appendChild(target);
            if (
                columnEl.clientHeight + target.clientHeight > splitHeight &&
                node.childElementCount != columns
            ) {
                target.detach();
                columnEl = node.createDiv("column");
                columnEl.appendChild(target);
            }
        }
    };

    let content: HTMLElement;

    onMount(async () => {
        if (!ready) return;
        buildStatblock(content);
    });

    $: {
        if (ready && content) {
            buildStatblock(content);
        }
    }
</script>

<div class="statblock-content" bind:this={content} />

<style>
    .statblock-content {
        font-family: "Noto Sans", "Myriad Pro", Calibri, Helvetica, Arial,
            sans-serif;
        font-size: 14px;
        color: var(--statblock-primary-color);
        background-color: var(--statblock-background-color);
        padding: 0.5em;
        border: 1px #ddd solid;
        box-shadow: 0 0 1.5em #ddd;
        margin-left: 2px;
        margin-right: 2px;
        display: flex;
        gap: 1rem;
    }
    .statblock-content > :global(.column) {
        width: 400px;
    }

    @media screen and (max-width: 400px) {
        .statblock-content > :global(.column) {
            width: 85vw;
        }
    }

    :global(.statblock-item-container) {
        margin-bottom: 0.25rem;
    }

    :global(.statblock-detached) {
        position: absolute;
        top: -9999px;
    }

    :global(.statblock-item-inline) {
        display: flex;
        justify-content: space-between;
    }
</style>
