<script lang="ts">
    import Traits from "./Traits.svelte";
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
    import type { StatblockItem } from "types/layout";
    import { /* linkifySpells, */ slugify, stringify } from "src/util/util";
    import Collapse from "./Collapse.svelte";
    import JavaScript from "./JavaScript.svelte";
    import Content from "./Content.svelte";
    import SpellItem from "./SpellItem.svelte";
    import type StatBlockPlugin from "src/main";
    import type { Monster, Trait } from "index";
    import { Linkifier } from "src/util/linkify";
    import Action from "./Action.svelte";

    const dispatch = createEventDispatcher();

    export let statblock: StatblockItem[];
    export let ready: boolean;
    export let classes: string[];

    export let columns: number;
    export const maxColumns: number = columns;
    export const detached = false;
    export const targets: HTMLElement[] = [];

    export let plugin: StatBlockPlugin;

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
        if (
            item.type == "ifelse" ||
            item.type == "javascript" ||
            item.type == "layout"
        )
            return true;

        if (!("properties" in item)) return true;
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
    type ContainerAndClasses = { container?: HTMLElement; classes?: string[] };
    const createDivForStatblockItem = (
        item: StatblockItem,
        params: ContainerAndClasses = {}
    ) => {
        return params.container
            ? params.container.createDiv(
                  `statblock-item-container ${slugify(item.type)}-container ${(
                      params.classes ?? []
                  ).join(" ")}`
              )
            : createDiv(
                  `statblock-item-container ${slugify(item.type)}-container ${(
                      params.classes ?? []
                  ).join(" ")}`
              );
    };

    const getElementForStatblockItem = (
        item: StatblockItem,
        params: ContainerAndClasses = {}
    ): HTMLElement[] => {
        if (!checkConditioned(item)) {
            return [];
        }
        const { container, classes } = params;
        const targets: HTMLElement[] = [];
        const target = createDivForStatblockItem(item, { container, classes });
        context.set("item", item);
        targets.push(target);
        switch (item.type) {
            case "group": {
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
                for (const nested of item.nested ?? []) {
                    const element = getElementForStatblockItem(nested, {
                        container: target,
                        classes: item.cls
                            ? [...(classes ?? []), item.cls]
                            : classes ?? []
                    });

                    targets.push(...element);
                }
                break;
            }
            case "action": {
                new Action({
                    target,
                    props: {
                        block: item,
                        monster
                    }
                });
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
                            const element = getElementForStatblockItem(block, {
                                container: target
                            });
                            targets.push(...element);
                        }
                        break;
                    }
                }

                break;
            }
            case "inline": {
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
                const inline = createDivForStatblockItem(item, {
                    container: target,
                    classes: [
                        "statblock-item-inline",
                        ...(item.cls
                            ? [...(classes ?? []), item.cls]
                            : classes ?? [])
                    ]
                });
                for (const nested of item.nested ?? []) {
                    getElementForStatblockItem(nested, {
                        container: inline.createDiv(
                            `statblock-inline-item ${slugify(
                                nested.type
                            )}-container`
                        )
                    });
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
            case "layout": {
                const layout = plugin.layouts.find(
                    ({ id }) => id == item.layout
                );
                if (layout?.blocks?.length) {
                    targets.push(
                        ...getElementForStatblockItem(
                            {
                                type: "group",
                                nested: layout.blocks,
                                id: item.layout,
                                properties: null
                            },
                            {
                                classes: [
                                    ...(classes ?? []),
                                    `${slugify(layout.name)}-nested`
                                ]
                            }
                        )
                    );
                }
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
                const blocks: (Spell | string)[] = monster[
                    item.properties[0]
                ] as Spell[];

                if (!Array.isArray(blocks) || !blocks.length) return;
                let spellBlocks: Array<SpellBlock> = blocks.reduce(
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
                            spell = {
                                spells: Linkifier.linkifySpells(
                                    current,
                                    context.get("context") as string
                                )
                            };
                        } else {
                            try {
                                spell = {
                                    level: Object.keys(current).shift(),
                                    spells: Linkifier.linkifySpells(
                                        stringify(
                                            Object.values(current).shift()
                                        ),
                                        context.get("context") as string
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
                                name:
                                    blockIndex == 0
                                        ? item.heading ?? "Spellcasting"
                                        : "",
                                property: item.properties[0],
                                desc: block.header,
                                item,
                                monster,
                                trait: monster[item.properties[0]] as Trait
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

                const firstElement = createDivForStatblockItem(item, {
                    container: target
                });
                targets.push(firstElement);
                if (item.heading) {
                    new SectionHeading({
                        target: firstElement.createDiv(
                            "statblock-section-heading"
                        ),
                        props: {
                            monster,
                            item
                        },
                        context
                    });
                }
                if (item.subheadingText && item.subheadingText.length) {
                    const prop = firstElement.createDiv(
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
                            render: item.markdown,
                            item,
                            monster,
                            trait: monster[item.properties[0]] as Trait
                        },
                        context
                    });
                    targets.push(prop);
                }
                try {
                    if (blocks.length > 0) {
                        new Traits({
                            target: firstElement.createDiv(
                                `statblock-item-container statblock-trait-prop`
                            ),
                            props: {
                                name: blocks[0].name,
                                desc: blocks[0].desc,
                                property: item.properties[0],
                                render: item.markdown,
                                item,
                                monster,
                                trait: blocks[0]
                            },
                            context
                        });
                        for (let i = 1; i < blocks.length; i++) {
                            const block = blocks[i];
                            const prop = (
                                container ? container : window
                            ).createDiv(
                                `statblock-item-container statblock-trait-prop`
                            );
                            new Traits({
                                target: prop,
                                props: {
                                    name: block.name,
                                    desc: block.desc,
                                    property: item.properties[0],
                                    render: item.markdown,
                                    item,
                                    monster,
                                    trait: block
                                },
                                context
                            });
                            targets.push(prop);
                        }
                    }
                } catch (e) {
                    return [];
                }
                break;
            }
        }
        if ("hasRule" in item && item.hasRule) {
            const rule = createDiv(
                [
                    "statblock-item-container rule-container",
                    ...(classes ?? [])
                ].join(" ")
            );
            new Rule({
                target: rule
            });
            targets.push(rule);
        }
        return targets.filter((el) => el.hasChildNodes());
    };
    $: maxHeight =
        !isNaN(Number(monster.columnHeight)) && monster.columnHeight > 0
            ? monster.columnHeight
            : Infinity;

    if (!targets.length) {
        for (let item of statblock) {
            const elements = getElementForStatblockItem(item);
            if (elements?.length) targets.push(...elements);
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
        const temp = document.body.createDiv({
            cls: "statblock-detached markdown-preview-view",
            attr: {
                style: `width: ${columnWidth}`
            }
        });
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
