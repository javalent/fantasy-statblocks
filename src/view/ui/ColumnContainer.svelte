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
    import { slugify, stringify } from "src/util/util";
    import Collapse from "./Collapse.svelte";
    import JavaScript from "./JavaScript.svelte";
    import Content from "./Content.svelte";
    import SpellItem from "./SpellItem.svelte";

    const dispatch = createEventDispatcher();

    export let statblock: StatblockItem[];
    export let ready: boolean;
    export let classes: string[];

    export let columns: number;
    export const maxColumns: number = columns;
    export const detached = false;
    export const targets: HTMLElement[] = [];

    const monster = getContext<Monster>("monster");
    const ensureColon = (header: string) => {
        if (/[^a-zA-Z0-9]$/.test(header)) return header;
        return `${header}:`;
    };
    type Spell = { level?: string; spells: string };
    type SpellBlock = { header: string; spells: Array<Spell> };

    const checkConditioned = (item: StatblockItem): boolean => {
        if (item.conditioned == null || !item.conditioned) return true;
        if ("nested" in item) {
            return item.nested.some((prop) => checkConditioned(prop));
        }
        if (item.type == "ifelse" || item.type == "javascript") return true;
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
        container?: HTMLElement
    ): HTMLElement[] => {
        if (!checkConditioned(item)) {
            return [];
        }
        const targets: HTMLElement[] = [];
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
            case "javascript": {
                new JavaScript({
                    target,
                    props: {
                        block: item
                    }
                });
                break;
            }
            case "collapse": {
                const elements = [];
                for (const nested of item.nested) {
                    const element = getElementForStatblockItem(nested);
                    elements.push(...element);
                }
                new Collapse({
                    target,
                    props: {
                        block: item,
                        elements
                    }
                });

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
                    const { condition, nested } = item.conditions[i];
                    const frame = document.body.createEl("iframe");
                    const funct = (frame.contentWindow as any).Function;
                    let parsed: boolean = false;
                    try {
                        const func = new funct("monster", condition);
                        parsed = func.call(undefined, monster) ?? false;
                    } catch (e) {
                        console.error(e);
                        continue;
                    }
                    document.body.removeChild(frame);
                    if (
                        parsed == true ||
                        (i == item.conditions.length - 1 && !condition?.length)
                    ) {
                        for (const block of nested) {
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
                let spellBlocks: Array<SpellBlock> = monster.spells.reduce(
                    (acc, current) => {
                        if (
                            typeof current === "string" &&
                            (current.charAt(current.length - 1) == ":" ||
                                !current.includes(":"))
                        ) {
                            const newBlock: SpellBlock = {
                                header: ensureColon(current),
                                spells: []
                            };
                            acc.push(newBlock);
                            return acc;
                        }
                        const lastBlock: SpellBlock = acc[acc.length - 1];
                        let spell: Spell;
                        if (typeof current == "string") {
                            spell = { spells: current };
                        } else {
                            try {
                                spell = {
                                    level: Object.keys(current).shift(),
                                    spells: stringify(
                                        Object.values(current).shift()
                                    )
                                };
                            } catch (e) {
                                return acc;
                            }
                        }
                        if (lastBlock) {
                            lastBlock.spells.push(spell);
                        } else {
                            const missingHeaderBlock: SpellBlock = {
                                header: `${monster.name} knows the following spells:`,
                                spells: [spell]
                            };
                            acc.push(missingHeaderBlock);
                        }
                        return acc;
                    },
                    []
                );

                for (
                    let blockIndex = 0;
                    blockIndex < spellBlocks.length;
                    blockIndex++
                ) {
                    const block = spellBlocks[blockIndex];
                    if (block.header?.length) {
                        const component = new Traits({
                            target: createDiv(),
                            props: {
                                name: blockIndex == 0 ? "Spellcasting" : "",
                                property: item.properties[0],
                                desc: block.header
                            }
                        });
                        targets.push(
                            component.$$.root
                                .firstElementChild as HTMLDivElement
                        );
                    }
                    for (const spell of block.spells) {
                        const component = new SpellItem({
                            target: createDiv(),
                            props: {
                                spell,
                                render: item.markdown
                            }
                        });
                        targets.push(
                            component.$$.root
                                .firstElementChild as HTMLUListElement
                        );
                    }
                }
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
                if (item.subheadingText && item.subheadingText.length) {
                    const prop = createDiv(
                        `statblock-item-container statblock-trait-prop`
                    );
                    new Traits({
                        target: prop,
                        props: {
                            name: "",
                            desc: item.subheadingText.replace(
                                /\{\{monster\}\}/g,
                                monster.name
                            ),
                            property: "trait-subheading",
                            render: item.markdown
                        },
                        context
                    });
                    targets.push(prop);
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
        if (
            item.type != "ifelse" &&
            item.type != "javascript" &&
            item.hasRule
        ) {
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

    if (!targets.length) {
        for (let item of statblock) {
            const elements = getElementForStatblockItem(item);
            targets.push(...elements);
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

    let HEIGHT_READY = false;
    const heights: number[] = [];
    let split: number;
    const buildStatblock = () => {
        const temp = document.body.createDiv(
            "statblock-detached markdown-preview-view"
        );
        const contentContainer = new Content({
            target: temp.createDiv({
                cls: ["obsidian-statblock-plugin", "statblock", ...classes]
            }),
            props: {
                heights,
                targets,
                columns: 1,
                columnWidth,
                classes
            }
        });
        contentContainer.$on("built", () => {
            const columnEl = temp.querySelector(".column");
            for (let target of targets) {
                heights.push(target.scrollHeight);
            }

            if (monster.forceColumns) {
                split = columnEl.scrollHeight / maxColumns;
            } else if (monster.columns && monster.columns > 0) {
                split = Math.max(
                    columnEl.scrollHeight / monster.columns,
                    columnEl.scrollHeight / columns
                );
            } else {
                split = Math.max(
                    600,
                    Math.min(columnEl.scrollHeight / columns, maxHeight)
                );
            }

            temp.empty();
            temp.detach();

            HEIGHT_READY = true;
        });
    };

    $: {
        if (ready) {
            buildStatblock();
        }
    }
</script>

{#if HEIGHT_READY}
    <Content {heights} {targets} {columns} {columnWidth} {split} {classes} />
{/if}

<style>
</style>