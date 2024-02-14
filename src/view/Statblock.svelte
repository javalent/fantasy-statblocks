<script lang="ts">
    import type { Monster } from "index";
    import {
        debounce,
        ExtraButtonComponent,
        Menu,
        Notice,
        stringifyYaml
    } from "obsidian";
    import { EXPORT_SYMBOL, SAVE_SYMBOL } from "src/data/constants";
    import type { Layout, StatblockItem } from "types/layout";
    import type StatBlockPlugin from "src/main";
    import {
        createEventDispatcher,
        onDestroy,
        onMount,
        setContext
    } from "svelte";
    import { Writable, writable } from "svelte/store";
    import type StatBlockRenderer from "./statblock";

    import Bar from "./ui/Bar.svelte";
    import ColumnContainer from "./ui/ColumnContainer.svelte";
    import Content from "./ui/Content.svelte";
    import { DefaultProperties } from "src/settings/settings.constants";

    const dispatch = createEventDispatcher();

    export let monster: Partial<Monster>;
    export let context: string;
    export let plugin: StatBlockPlugin;
    export let statblock: StatblockItem[];
    export let renderer: StatBlockRenderer;
    export let layout: Layout;
    export let canSave: boolean = true;
    export let icons = true;

    let maxColumns =
        !isNaN(Number(monster.columns)) && Number(monster.columns) > 0
            ? Number(monster.columns)
            : 2;

    $: monsterColumnWidth = Number(`${monster.columnWidth}`.replace(/\D/g, ""));
    $: columnWidth =
        !isNaN(monsterColumnWidth) && monsterColumnWidth > 0
            ? monsterColumnWidth
            : 400;

    let canExport = monster.export ?? plugin.settings.export;
    let canDice =
        plugin.canUseDiceRoller && (monster.dice ?? plugin.settings.useDice);
    let canRender = monster.render ?? plugin.settings.renderDice;

    setContext<StatBlockPlugin>("plugin", plugin);
    setContext<boolean>("tryToRenderLinks", plugin.settings.tryToRenderLinks);
    setContext<string>("context", context);
    setContext<Partial<Monster>>("monster", monster);
    setContext<boolean>("dice", canDice);
    setContext<boolean>("render", canRender);
    setContext<StatBlockRenderer>("renderer", renderer);
    setContext<Layout>("layout", layout);

    const reset = writable<boolean>(false);
    setContext<Writable<boolean>>("reset", reset);

    let container: HTMLElement;
    let columns: number = maxColumns;
    let ready = false;

    const setColumns = () => {
        if (monster.forceColumns) {
            columns = maxColumns;
            observer.disconnect();
            return;
        }
        const width = container.clientWidth;
        columns = Math.min(
            Math.max(Math.floor(width / columnWidth), 1),
            maxColumns
        );
    };
    const onResize = debounce(
        () => {
            setColumns();
            if (!ready) ready = true;
        },
        100,
        false
    );
    const observer = new ResizeObserver(onResize);

    onMount(() => {
        onResize();
        observer.observe(container);
    });

    onDestroy(() => {
        observer.disconnect();
    });

    const iconsEl = (node: HTMLElement) => {
        new ExtraButtonComponent(node).setIcon("vertical-three-dots");
    };
    const menu = new Menu();
    menu.addItem((item) =>
        item
            .setIcon(SAVE_SYMBOL)
            .setTitle("Save to Bestiary")
            .setDisabled(!canSave)
            .onClick(() => dispatch("save"))
    );
    menu.addItem((item) => {
        item.setTitle("Copy YAML")
            .setIcon("code")
            .onClick(async () => {
                try {
                    await navigator.clipboard.writeText(stringifyYaml(monster));
                    new Notice("Creature YAML copied to clipboard");
                } catch (e) {
                    new Notice(
                        `There was an issue copying the yaml:\n\n${e.message}`
                    );
                }
            });
    });
    if (canExport)
        menu.addItem((item) =>
            item
                .setIcon(EXPORT_SYMBOL)
                .setTitle("Export as PNG")
                .onClick(() => dispatch("export"))
        );
    if (canDice)
        menu.addItem((item) =>
            item
                .setIcon("reset")
                .setTitle("Reset Dice")
                .onClick(() => {
                    reset.set(true);
                    reset.set(false);
                })
        );
    const showMenu = (evt: MouseEvent) => {
        menu.showAtMouseEvent(evt);
    };

    const slugify = (str: string, fallback: string = "") =>
        str?.toLowerCase().replace(/\s+/g, "-") ?? fallback;

    const name = slugify(monster.name, "no-name");
    const layoutName = slugify(layout.name, "no-layout");
    const getNestedLayouts = (blocks: StatblockItem[]): string[] => {
        const classes: string[] = [];
        for (const block of blocks) {
            if (block.type == "layout") {
                const layout = plugin.layouts.find((l) => l.id == block.layout);
                classes.push(slugify(layout?.name));
            }
            if ("nested" in block) {
                classes.push(...getNestedLayouts(block.nested));
            }
        }
        return classes;
    };

    const classes = [name, layoutName, ...getNestedLayouts(statblock)].filter(
        (n) => n?.length
    );

    const customProps: string[] = [];
    const transform = (str: string) => {
        return `--statblock-${str.replace(
            /[A-Z]/g,
            (m) => `-${m.toLowerCase()}`
        )}`;
    };
    for (let [key, value] of Object.entries(layout.cssProperties ?? {})) {
        if (value in DefaultProperties) {
            value = `var(${transform(value)})`;
        }
        customProps.push(`${transform(key)}: ${value};`);
    }
</script>

<div class="container" bind:this={container} style={customProps.join("")}>
    {#if ready}
        <div
            class:obsidian-statblock-plugin={true}
            class:statblock={true}
            class={classes.join(" ")}
        >
            {#if monster}
                <Bar />
                {#key columns}
                    <ColumnContainer
                        {columns}
                        {maxColumns}
                        {statblock}
                        {ready}
                        {classes}
                        {plugin}
                        on:save
                        on:export
                    />
                {/key}
                <Bar />
            {:else}
                <span>Invalid monster.</span>
            {/if}
        </div>
        {#if icons}
            <div class="icons" use:iconsEl on:click={showMenu} />
        {/if}
    {/if}
</div>

<style>
    /**
    * Active theming variables.
    */
    .statblock {
        --active--primary-color: var(--statblock-primary-color);
        --active--rule-color: var(--statblock-rule-color);
        --active--background-color: var(--statblock-background-color);

        --active--bar-color: var(--statblock-bar-color);
        --active--bar-border-size: var(--statblock-bar-border-size);
        --active--bar-border-color: var(--statblock-bar-border-color);

        --active--image-width: var(--statblock-image-width);
        --active--image-height: var(--statblock-image-height);
        --active--image-border-size: var(--statblock-image-border-size);
        --active--image-border-color: var(
            --statblock-image-border-color,
            --active--primary-color
        );

        --active--border-size: var(--statblock-border-size);
        --active--border-color: var(--statblock-border-color);

        --active--box-shadow-color: var(--statblock-box-shadow-color);
        --active--box-shadow-x-offset: var(--statblock-box-shadow-x-offset);
        --active--box-shadow-y-offset: var(--statblock-box-shadow-y-offset);
        --active--box-shadow-blur: var(--statblock-box-shadow-blur);

        --active--font-color: var(
            --statblock-font-color,
            --active--primary-color
        );
        --active--font-weight: var(--statblock-font-weight);

        --active--content-font: var(--statblock-content-font: );
        --active--content-font-size: var(--statblock-content-font-size);

        --active--heading-font: var(--statblock-heading-font);
        --active--heading-font-color: var(--active--font-color);
        --active--heading-font-size: var(--statblock-heading-font-size);
        --active--heading-font-variant: var(--statblock-heading-font-variant);
        --active--heading-font-weight: var(--active--font-weight);
        --active--heading-line-height: var(--statblock-heading-line-height);

        --active--property-line-height: var(--statblock-property-line-height);
        --active--property-font-color: var(--active--font-color);
        --active--property-name-font-color: var(--active--font-color);
        --active--property-name-font-weight: var(
            --statblock-property-name-font-weight
        );

        --active--section-heading-border-size: var(
            --statblock-section-heading-border-size
        );
        --active--section-heading-border-color: var(
            --statblock-section-heading-border-color,
            --active--primary-color
        );
        --active--section-heading-font-color: var(--active--font-color);
        --active--section-heading-font-size: var(
            --statblock-section-heading-font-size
        );
        --active--section-heading-font-variant: var(
            --statblock-section-heading-font-variant
        );
        --active--section-heading-font-weight: var(
            --statblock-section-heading-font-weight
        );

        --active--saves-line-height: var(--statblock-saves-line-height);

        --active--spells-font-style: var(--statblock-spells-font-style);

        --active--subheading-font-size: var(--statblock-subheading-font-size);
        --active--subheading-font-style: var(--statblock-subheading-font-style);
        --active--subheading-font-weight: var(
            --statblock-subheading-font-weight
        );

        --active--table-header-font-weight: var(
            --statblock-table-header-font-weight
        );

        --active--traits-font-weight: var(--statblock-traits-font-weight);
        --active--traits-font-style: var(--statblock-traits-font-style);

        --active--link-style: var(--statblock-link-style);
    }

    .statblock :global(a) {
        font-style: var(--active--link-style);
    }
    .container {
        display: flex;
        width: 100%;
        margin: 0.25rem 0;
    }
    .statblock {
        margin: 0 auto;
        position: relative;
    }

    .icons {
        position: absolute;
        left: 0;
    }
</style>
