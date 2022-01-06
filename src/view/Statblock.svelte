<script lang="ts">
    import type { Monster } from "@types";
    import { debounce, ExtraButtonComponent, Menu } from "obsidian";
    import {
        EXPORT_SYMBOL,
        SAVE_SYMBOL,
        StatblockItem
    } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import {
        createEventDispatcher,
        onDestroy,
        onMount,
        setContext
    } from "svelte";
    import { Writable, writable } from "svelte/store";

    import Bar from "./ui/Bar.svelte";
    import Content from "./ui/Content.svelte";

    const dispatch = createEventDispatcher();

    export let monster: Monster;
    export let context: string;
    export let plugin: StatBlockPlugin;
    export let statblock: StatblockItem[];

    let canExport = monster.export ?? plugin.settings.export;
    let canDice =
        plugin.canUseDiceRoller && (monster.dice ?? plugin.settings.useDice);
    let canRender = monster.render ?? plugin.settings.renderDice;

    setContext<StatBlockPlugin>("plugin", plugin);
    setContext<string>("context", context);
    setContext<Monster>("monster", monster);
    setContext<boolean>("dice", canDice);
    setContext<boolean>("render", canRender);

    const reset = writable<boolean>(false);
    setContext<Writable<boolean>>("reset", reset);

    let container: HTMLElement;
    let columns: number = 1;
    let ready = false;
    const onResize = debounce(
        () => {
            const width = container.clientWidth;
            columns = Math.max(Math.floor(width / 400), 1);
            if (!ready) ready = true;
        },
        100,
        false
    );
    const observer = new ResizeObserver(onResize);

    onMount(() => {
        const width = container.clientWidth;
        columns = Math.max(Math.min(Math.floor(width / 400), 2), 1);
        observer.observe(container);
    });

    onDestroy(() => {
        observer.disconnect();
    });

    const icons = (node: HTMLElement) => {
        new ExtraButtonComponent(node).setIcon("vertical-three-dots");
    };
    const menu = new Menu(plugin.app);
    menu.addItem((item) =>
        item
            .setIcon(SAVE_SYMBOL)
            .setTitle("Save as Homebrew")
            .onClick(() => dispatch("save"))
    );
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

    const name =
        monster?.name
            ?.toLowerCase()
            .replace(/[^A-Za-z0-9\s]/g, "")
            .replace(/\s+/g, "-") ?? "no-name";
</script>

<div class="container" bind:this={container}>
    {#if ready}
        <div
            class:obsidian-statblock-plugin={true}
            class:statblock={true}
            class={name}
        >
            {#if monster}
                <Bar />
                {#key columns}
                    <Content {columns} {statblock} {ready} on:save on:export />
                {/key}
                <Bar />
            {:else}
                <span>Invalid monster.</span>
            {/if}
        </div>
        <div class="icons" use:icons on:click={showMenu} />
    {/if}
</div>

<style>
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
        right: 0;
    }
</style>
