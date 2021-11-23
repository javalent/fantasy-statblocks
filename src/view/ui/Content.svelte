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
    import { getContext, onMount, tick } from "svelte";

    export let monster: Monster;
    export let statblock: StatblockItem[];
    export let columns: number = 1;
    export let ready: boolean;

    const plugin = getContext<StatblockPlugin>("plugin");

    const buildStatblock = (node: HTMLElement) => {
        node.empty();
        let columnEl = node.createDiv("column");
        const targets: HTMLElement[] = [];

        for (let item of statblock) {
            const target = createDiv("statblock-item-container");

            if (item.conditioned) {
                if (!item.properties.some((prop) => prop in monster)) continue;
            }
            switch (item.type) {
                case "heading": {
                    new Heading({
                        target,
                        props: {
                            monster,
                            item
                        },
                        context: new Map([["plugin", plugin]])
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
                    const blocks: Trait[] = monster[
                        item.properties[0]
                    ] as Trait[];
                    if (!Array.isArray(blocks) || !blocks.length) continue;

                    if (item.heading) {
                        new SectionHeading({
                            target,
                            props: {
                                header: item.heading
                            },
                            context: new Map([["plugin", plugin]])
                        });
                        targets.push(target);
                    }
                    try {
                        for (const block of blocks) {
                            const prop = createDiv("statblock-item-container");
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
                        continue;
                    }

                    break;
                }
                case "spells": {
                    const blocks: Trait[] = monster[
                        item.properties[0]
                    ] as Trait[];
                    if (!Array.isArray(blocks) || !blocks.length) continue;

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
                default: {
                    continue;
                }
            }
            if (item.hasRule) {
                new Rule({
                    target
                });
            }

            if (item.type != "section") targets.push(target);
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

    :global(.statblock-item-container) {
        margin-bottom: 0.25rem;
    }

    :global(.statblock-detached) {
        position: absolute;
        top: -9999px;
    }
</style>
