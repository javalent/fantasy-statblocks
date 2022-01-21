<script lang="ts">
    import type { Monster, Trait } from "@types";
    import type { StatblockItem } from "src/data/constants";

    import Traits from "./Traits.svelte";
    import Spells from "./Spells.svelte";
    import Heading from "./Heading.svelte";
    import PropertyLine from "./PropertyLine.svelte";
    import Rule from "./Rule.svelte";
    import Saves from "./Saves.svelte";
    import SectionHeading from "./SectionHeading.svelte";
    import Subheading from "./Subheading.svelte";
    import Table from "./Table.svelte";
    import Text from "./Text.svelte";
    import {
        onMount,
        createEventDispatcher,
        getAllContexts,
        getContext
    } from "svelte";
    import Image from "./Image.svelte";

    const dispatch = createEventDispatcher();

    export let statblock: StatblockItem[];
    export let columns: number = 1;
    export let ready: boolean;
    export let maxColumns: number = columns;

    const monster = getContext<Monster>("monster");

    const checkConditioned = (item: StatblockItem) => {
        if (item.conditioned == null || !item.conditioned) return true;
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

    const context = getAllContexts();

    const getElementForStatblockItem = (
        item: StatblockItem,
        container?: HTMLDivElement
    ): HTMLDivElement[] => {
        const targets: HTMLDivElement[] = [];
        const target = container ?? createDiv("statblock-item-container");
        context.set("item", item);
        if (!checkConditioned(item)) {
            return [];
        }
        targets.push(target);
        switch (item.type) {
            case "group": {
                for (const nested of item.nested ?? []) {
                    const element = getElementForStatblockItem(nested, target);
                    targets.push(...element);
                }
                break;
            }
            case "heading": {
                const heading = new Heading({
                    target,
                    props: {
                        monster,
                        item
                    },
                    context
                });
                heading.$on("save", (e) => dispatch("save", e.detail));
                heading.$on("export", (e) => dispatch("export", e.detail));
                break;
            }
            case "inline": {
                const inline = createDiv("statblock-item-inline");
                for (const nested of item.nested ?? []) {
                    getElementForStatblockItem(
                        nested,
                        inline.createDiv("statblock-inline-item")
                    );
                }
                targets.push(inline);
                break;
            }
            case "image": {
                new Image({
                    target,
                    props: {
                        monster,
                        item
                    },
                    context
                });
                break;
            }
            case "property": {
                new PropertyLine({
                    target,
                    props: {
                        monster,
                        item
                    },
                    context
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
                    context
                });
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
                    context
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
                    context
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
                    context
                });
                break;
            }
            case "text": {
                new Text({
                    target,
                    props: {
                        monster,
                        item
                    }
                });
                break;
            }
            case "traits": {
                const blocks: Trait[] = monster[item.properties[0]] as Trait[];
                if (!Array.isArray(blocks) || !blocks.length) return [];

                if (item.heading) {
                    new SectionHeading({
                        target,
                        props: {
                            header: item.heading
                        },
                        context
                    });
                }
                try {
                    for (const block of blocks) {
                        const prop = createDiv("statblock-item-container");
                        new Traits({
                            target: prop,
                            props: {
                                name: block.name,
                                desc: block.desc,
                                render: item.markdown
                            },
                            context
                        });
                        targets.push(prop);
                    }
                } catch (e) {
                    return [];
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
    $: maxHeight =
        !isNaN(Number(monster.columnHeight)) && monster.columnHeight > 0
            ? monster.columnHeight
            : 600;

    const buildStatblock = (node: HTMLElement) => {
        node.empty();
        const targets: HTMLElement[] = [];
        for (let item of statblock) {
            targets.push(...getElementForStatblockItem(item));
        }

        let columnEl = node.createDiv("column");
        if (columns == 1) {
            targets.forEach((el) => columnEl.appendChild(el));
            return;
        }

        const temp = document.body.createDiv("statblock-detached");
        for (let target of targets) {
            temp.appendChild(target);
        }
        temp.style.width = columnWidth;

        let split: number;

        if (monster.forceColumns) {
            split = temp.clientHeight / maxColumns;
        } else if (monster.columns && monster.columns > 0) {
            split = Math.max(
                temp.clientHeight / monster.columns,
                temp.clientHeight / columns
            );
        } else {
            split = Math.min(
                Math.max(temp.clientHeight / columns, maxHeight),
                maxHeight
            );
        }

        temp.empty();
        temp.detach();

        for (let target of targets) {
            columnEl.appendChild(target);
            if (
                columnEl.clientHeight > split &&
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
    let columnWidth = "400px";

    if (monster.columnWidth) {
        if (typeof monster.columnWidth == "number") {
            columnWidth = `${monster.columnWidth}px`;
        }
        if (typeof monster.columnWidth == "string") {
            columnWidth = monster.columnWidth;
        }
    }
</script>

<div
    class="statblock-content-container"
    style="--statblock-column-width: {columnWidth};"
>
    <div class="statblock-content" bind:this={content} />
</div>

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
        width: var(--statblock-column-width);
    }

    @media screen and (max-width: 400px) {
        .statblock-content > :global(.column) {
            width: 75vw;
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
