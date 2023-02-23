<script lang="ts">
    import type { Monster, Trait } from "@types";

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
    import { createEventDispatcher, getAllContexts, getContext } from "svelte";
    import Image from "./Image.svelte";
    import type { StatblockItem } from "src/layouts/types";
    import { slugify } from "src/util/util";

    const dispatch = createEventDispatcher();

    export let statblock: StatblockItem[];
    export let columns: number = 1;
    export let ready: boolean;
    export let maxColumns: number = columns;

    const monster = getContext<Monster>("monster");

    const checkConditioned = (item: StatblockItem): boolean => {
        if (item.type == "ifelse") return true;
        if (item.conditioned == null || !item.conditioned) return true;
        if ("nested" in item) {
            return item.nested.some((prop) => checkConditioned(prop));
        }
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
        if (!checkConditioned(item)) {
            return [];
        }
        const targets: HTMLDivElement[] = [];
        const target = container
            ? container.createDiv(
                  `statblock-item-container ${slugify(item.type)}-container`
              )
            : createDiv(
                  `statblock-item-container ${slugify(item.type)}-container`
              );
        context.set("item", item);
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
            case "ifelse": {
                for (let i = 0; i < item.conditions.length; i++) {
                    const { condition, blocks } = item.conditions[i];
                    const frame = document.body.createEl("iframe");
                    const funct = (frame.contentWindow as any).Function;
                    const func = new funct("monster", condition);
                    const parsed = func.call(undefined, monster) ?? false;
                    document.body.removeChild(frame);
                    if (parsed == true || i == item.conditions.length - 1) {
                        for (const block of blocks) {
                            const element = getElementForStatblockItem(
                                block,
                                target
                            );
                            targets.push(...element);
                        }
                        break;
                    }
                }

                break;
            }
            case "inline": {
                const inline = target.createDiv("statblock-item-inline");
                for (const nested of item.nested ?? []) {
                    getElementForStatblockItem(
                        nested,
                        inline.createDiv(
                            `statblock-inline-item ${slugify(
                                nested.type
                            )}-container`
                        )
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
                        property: item.properties[0],
                        monster,
                        render: item.markdown
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
                            monster,
                            item
                        },
                        context
                    });
                }
                try {
                    for (const block of blocks) {
                        const prop = createDiv(
                            `statblock-item-container statblock-trait-prop`
                        );
                        new Traits({
                            target: prop,
                            props: {
                                name: block.name,
                                desc: block.desc,
                                property: item.properties[0],
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
        if (item.type != "ifelse" && item.hasRule) {
            const rule = createDiv("statblock-item-container rule-container");
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
            : Infinity;

    const targets: HTMLElement[] = [];
    for (let item of statblock) {
        const elements = getElementForStatblockItem(item);
        targets.push(...elements);
    }

    const buildStatblock = (node: HTMLElement) => {
        node.empty();

        let columnEl = node.createDiv("column");
        if (columns == 1) {
            targets.forEach((el) => columnEl.appendChild(el));
            return;
        }

        const temp = document.body.createDiv("statblock-detached");
        const heightmap: Map<HTMLElement, number> = new Map();
        for (let target of targets) {
            temp.appendChild(target);
            heightmap.set(target, Math.floor(target.clientHeight));
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
            split = Math.max(
                600,
                Math.min(temp.clientHeight / columns, maxHeight)
            );
        }

        temp.empty();
        temp.detach();

        for (let target of targets) {
            if (
                node.childElementCount < columns &&
                columnEl.clientHeight + heightmap.get(target) > split
            ) {
                columnEl = node.createDiv("column");
            }
            columnEl.appendChild(target);
        }
    };

    let content: HTMLElement;

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
        font-family: var(--statblock-content-font);
        font-size: var(--statblock-content-font-size);
        color: var(--statblock-font-color);
        background-color: var(--statblock-background-color);
        padding: 0.5em;
        border: var(--statblock-border-size) var(--statblock-border-color) solid;
        box-shadow: var(--statblock-box-shadow-x-offset)
            var(--statblock-box-shadow-y-offset)
            var(--statblock-box-shadow-blur) var(--statblock-box-shadow-color);
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
