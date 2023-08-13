import { App, ButtonComponent, Modal, TFile } from "obsidian";
import { Layout5e } from "src/layouts/basic 5e/basic5e";
import { MarkdownRenderChild } from "obsidian";
import type { Monster, StatblockParameters, Trait } from "../../index";

import Statblock from "./Statblock.svelte";
import type StatBlockPlugin from "src/main";

import fastCopy from "fast-copy";
import type {
    CollapseItem,
    GroupItem,
    IfElseItem,
    InlineItem,
    JavaScriptItem,
    Layout,
    LayoutItem,
    SavesItem,
    StatblockItem,
    TraitsItem
} from "types/layout";
import type Collapse from "./ui/Collapse.svelte";
import { append } from "src/util/util";

type RendererParameters = {
    container: HTMLElement;
    plugin: StatBlockPlugin;
    context?: string;
    layout?: Layout;
} & (
    | {
          monster: Monster;
      }
    | {
          params: Partial<StatblockParameters>;
      }
);

export default class StatBlockRenderer extends MarkdownRenderChild {
    topBar: HTMLDivElement;
    bottomBar: HTMLDivElement;
    loaded: boolean = false;
    statblockEl: HTMLDivElement;
    contentEl: HTMLDivElement;
    container: HTMLElement;
    monster: Monster;
    plugin: StatBlockPlugin;
    params: Partial<StatblockParameters>;
    context: string;
    layout: Layout;
    constructor(public rendererParameters: RendererParameters) {
        super(rendererParameters.container);

        this.container = rendererParameters.container;
        this.plugin = rendererParameters.plugin;
        this.context = rendererParameters.context ?? "";
        if ("params" in rendererParameters) {
            this.params = rendererParameters.params;
            this.monster = Object.assign(
                {},
                this.plugin.bestiary.get(this.params.monster) ??
                    this.plugin.bestiary.get(this.params.creature)
            );
        } else {
            this.params = {};
            this.monster = rendererParameters.monster;
        }
        this.setLayout();

        this.init();
    }
    setLayout() {
        this.layout =
            this.plugin.layouts.find(
                (layout) =>
                    layout.name ==
                        (this.params.layout ?? this.monster.layout) ||
                    layout.name ==
                        (this.params.statblock ?? this.monster.statblock)
            ) ?? this.plugin.defaultLayout;
    }
    get canSave() {
        return "name" in this.params;
    }

    async build(): Promise<Partial<Monster>> {
        let built: Partial<Monster> = Object.assign(
            {},
            this.monster ?? {},
            this.params ?? {}
        );

        if (!Object.values(built).length) {
            built = Object.assign({}, built, {
                note: this.context
            });
        }
        if (built.note) {
            const note = Array.isArray(built.note)
                ? (<string[]>built.note).flat(Infinity).pop()
                : built.note;
            const file = await app.metadataCache.getFirstLinkpathDest(
                `${note}`,
                this.context ?? ""
            );
            if (file && file instanceof TFile) {
                const cache = await app.metadataCache.getFileCache(file);
                Object.assign(
                    built,
                    fastCopy(cache.frontmatter) ?? {},
                    this.params
                );
            }
        }
        if ("image" in built) {
            if (Array.isArray(built.image)) {
                built.image = built.image.flat(2).join("");
            }
        }

        const extensions = this.getExtensions(built);

        /**
         * At this point, the built creature has been fully resolved from all
         * extensions and in-memory creature definitions.
         */
        built = Object.assign({}, ...extensions, built);

        /**
         * Traits logic:
         * Defined in Params: ALWAYS SHOW
         * then, defined in memory
         * then, defined via extension
         *
         * Traits defined using `trait+: ...` will always just add to the underlying trait.
         */

        for (const block of this.unwrapBlocks(this.layout.blocks)) {
            for (let property of block.properties) {
                /** Ignore properties that aren't in the final built creature. */
                if (
                    !(property in built) &&
                    !(`${property}+` in built) &&
                    !(`${property}-` in built)
                ) {
                    continue;
                }
                switch (block.type) {
                    case "traits": {
                        const $TRAIT_MAP: Map<string, Trait> = new Map();
                        const $ADDITIVE_TRAITS: Trait[] = [];
                        /** Add traits from the extensions group first. */
                        for (const extension of extensions) {
                            let traits = getIterable<Trait>(
                                property,
                                extension
                            );
                            for (const trait of traits) {
                                $TRAIT_MAP.set(trait.name, trait);
                            }

                            traits = getIterable<Trait>(
                                `${property}+` as keyof Monster,
                                extension
                            );
                            for (const trait of traits) {
                                $ADDITIVE_TRAITS.push(trait);
                            }
                        }
                        //next, underlying monster object
                        let traits = getIterable<Trait>(property, this.monster);
                        for (const trait of traits) {
                            if (!(property in this.params)) {
                                $TRAIT_MAP.delete(trait.name);
                                $ADDITIVE_TRAITS.push(trait);
                            } else {
                                $TRAIT_MAP.set(trait.name, trait);
                            }
                        }
                        traits = getIterable<Trait>(
                            `${property}+` as keyof Monster,
                            this.monster
                        );
                        for (const trait of traits) {
                            $ADDITIVE_TRAITS.push(trait);
                        }

                        //finally, the parameters should always be added
                        traits = getIterable<Trait>(property, this.params);
                        for (const trait of traits) {
                            $TRAIT_MAP.delete(trait.name);
                            $ADDITIVE_TRAITS.push(trait);
                        }

                        traits = getIterable<Trait>(
                            `${property}+` as keyof Monster,
                            this.params
                        );
                        for (const trait of traits) {
                            $ADDITIVE_TRAITS.push(trait);
                        }

                        traits = getIterable<Trait>(
                            `${property}-` as keyof Monster,
                            this.params
                        );
                        for (const trait of traits) {
                            $TRAIT_MAP.delete(trait.name);
                        }

                        Object.assign(built, {
                            [property]: [
                                ...$TRAIT_MAP.values(),
                                ...$ADDITIVE_TRAITS
                            ]
                        });
                        break;
                    }
                    case "saves": {
                        /** TODO: Reimplement combinatorial saves */
                        let saves: {
                            [x: string]: any;
                        }[] = [];
                        if (
                            property in built &&
                            !Array.isArray(built[property]) &&
                            typeof built[property] == "object"
                        ) {
                            saves = Object.entries(built[property] ?? {}).map(
                                ([key, value]) => {
                                    return { [key]: value };
                                }
                            );
                        }
                        Object.assign(built, {
                            [property]: saves
                        });
                        let additive: {
                            [x: string]: any;
                        }[] = [];
                        if (
                            `${property}+` in built &&
                            !Array.isArray(
                                built[`${property}+` as keyof Monster]
                            ) &&
                            typeof built[`${property}+` as keyof Monster] ==
                                "object"
                        ) {
                            additive = Object.entries(
                                built[property] ?? {}
                            ).map(([key, value]) => {
                                return { [key]: value };
                            });
                        }
                        if (additive.length) {
                            Object.assign(built, {
                                [property]: append(
                                    built[property] as { [x: string]: any }[],
                                    additive
                                )
                            });
                        }
                        break;
                    }
                    default: {
                        if (`${property}+` in built && property in built) {
                            const additive = append(
                                built[property] as string | any[],
                                built[`${property}+` as keyof Monster] as
                                    | string
                                    | any[]
                            );
                            if (additive) {
                                Object.assign(built, {
                                    [property]: additive
                                });
                            }
                        }
                    }
                }
            }
        }

        built = this.transformLinks(built);
        this.monster = built as Monster;

        return built;
    }

    /**
     * This is used to return a list of "saves" or "traits" block in the layout.
     */
    unwrapBlocks(
        blocks: StatblockItem[]
    ): Exclude<
        StatblockItem,
        | GroupItem
        | InlineItem
        | IfElseItem
        | JavaScriptItem
        | CollapseItem
        | LayoutItem
    >[] {
        let ret: Exclude<
            StatblockItem,
            | GroupItem
            | InlineItem
            | IfElseItem
            | JavaScriptItem
            | CollapseItem
            | LayoutItem
        >[] = [];
        for (const block of blocks) {
            switch (block.type) {
                case "group":
                case "inline": {
                    ret.push(...this.unwrapBlocks(block.nested));
                    break;
                }
                case "collapse":
                case "layout":
                case "ifelse":
                case "javascript": {
                    continue;
                }
                default:
                    ret.push(block);
                    break;
            }
        }

        return ret;
    }

    async init() {
        const statblock = new Statblock({
            target: this.containerEl,
            props: {
                context: this.context,
                monster: await this.build(),
                statblock: this.layout.blocks,
                layout: this.layout.name,
                plugin: this.plugin,
                renderer: this,
                canSave: this.canSave
            }
        });
        statblock.$on("save", async () => {
            if (
                this.plugin.bestiary.has(this.monster.name) &&
                !(await confirmWithModal(
                    this.plugin.app,
                    "This will overwrite an existing monster in settings. Are you sure?"
                ))
            )
                return;
            this.plugin.saveMonster({
                ...fastCopy(this.monster),
                source: this.monster.source ?? "Homebrew",
                layout: this.layout.name
            });
        });

        statblock.$on("export", () => {
            this.plugin.exportAsPng(
                this.monster.name,
                this.containerEl.firstElementChild
            );
        });
    }
    transformLinks(monster: Partial<Monster>): Partial<Monster> {
        const built = JSON.parse(
            JSON.stringify(monster)
                .replace(/\\#/g, "#")
                .replace(
                    /\[\["(.+?)"\]\]/g,
                    `"<STATBLOCK-LINK>$1</STATBLOCK-LINK>"`
                )
                .replace(/\[\[([^"]+?)\]\]/g, (match, p1) => {
                    return `<STATBLOCK-LINK>${p1}</STATBLOCK-LINK>`;
                })
                .replace(
                    /\[([^"]*?)\]\(([^"]+?)\)/g,
                    (s, alias: string, path: string) => {
                        if (alias.length) {
                            return `<STATBLOCK-LINK>${path}|${alias}</STATBLOCK-LINK>`;
                        }
                        return `<STATBLOCK-LINK>${path}</STATBLOCK-LINK>`;
                    }
                )
        );

        return built;
    }
    getExtensions(monster: Partial<Monster>): Partial<Monster>[] {
        let extensions: Partial<Monster>[] = [];
        if (
            !("extends" in monster) ||
            !(
                Array.isArray(monster.extends) ||
                typeof monster.extends == "string"
            )
        ) {
            return extensions;
        }
        if (monster.extends && monster.extends.length) {
            for (const extension of [monster.extends].flat()) {
                const extensionMonster = this.plugin.bestiary.get(extension);
                if (!extensionMonster) continue;
                extensions.push(
                    extensionMonster,
                    ...this.getExtensions(extensionMonster)
                );
            }
        }

        return extensions;
    }
}

export async function confirmWithModal(
    app: App,
    text: string,
    buttons: { cta: string; secondary: string } = {
        cta: "Yes",
        secondary: "No"
    }
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const modal = new ConfirmModal(app, text, buttons);
        modal.onClose = () => {
            resolve(modal.confirmed);
        };
        modal.open();
    });
}

export class ConfirmModal extends Modal {
    constructor(
        app: App,
        public text: string,
        public buttons: { cta: string; secondary: string }
    ) {
        super(app);
    }
    confirmed: boolean = false;
    async display() {
        new Promise((resolve) => {
            this.contentEl.empty();
            this.contentEl.addClass("confirm-modal");
            this.contentEl.createEl("p", {
                text: this.text
            });
            const buttonEl = this.contentEl.createDiv(
                "fantasy-calendar-confirm-buttons"
            );
            new ButtonComponent(buttonEl)
                .setButtonText(this.buttons.cta)
                .setCta()
                .onClick(() => {
                    this.confirmed = true;
                    this.close();
                });
            new ButtonComponent(buttonEl)
                .setButtonText(this.buttons.secondary)
                .onClick(() => {
                    this.close();
                });
        });
    }
    onOpen() {
        this.display();
    }
}

function getIterable<T = any>(
    property: keyof Monster,
    obj: Partial<Monster>
): T[] {
    if (property in obj && Array.isArray(obj[property])) {
        return obj[property] as T[];
    }
    return [] as T[];
}
