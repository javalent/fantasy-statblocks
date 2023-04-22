import { App, ButtonComponent, Modal, TFile } from "obsidian";
import { Layout5e } from "src/layouts/basic 5e/basic5e";
import { MarkdownRenderChild } from "obsidian";
import type { Monster, StatblockParameters, Trait } from "../../index";

import Statblock from "./Statblock.svelte";
import type StatBlockPlugin from "src/main";

import fastCopy from "fast-copy";
import type {
    GroupItem,
    InlineItem,
    Layout,
    SavesItem,
    StatblockItem,
    TraitsItem
} from "types/layout";
import { append, transformTraits } from "src/util/util";

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
                Object.assign(built, fastCopy(cache.frontmatter) ?? {});
            }
        }
        if ("image" in built) {
            if (Array.isArray(built.image)) {
                built.image = built.image.flat(2).join("");
            }
        }

        for (const block of this.getBlocksToTransform(this.layout.blocks)) {
            for (let property of block.properties) {
                if (!(property in built) && !(`${property}+` in built)) {
                    continue;
                }
                let isAdditive = false;
                let original = property;
                if (`${property}+` in built) {
                    property = `${property}+` as keyof Monster;
                    isAdditive = true;
                }
                let transformedProperty = built[property];
                if (block.type == "traits") {
                    transformedProperty = transformTraits(
                        (this.monster[original] as Trait[]) ?? [],
                        (built[property] as Trait[]) ?? []
                    );
                } else if (
                    block.type == "saves" &&
                    !Array.isArray(built[property]) &&
                    typeof built[property] == "object"
                ) {
                    transformedProperty = Object.entries(
                        built[property] ?? {}
                    ).map(([key, value]) => {
                        return { [key]: value };
                    });
                }
                if (isAdditive) {
                    transformedProperty = append(
                        this.monster[original] as any[] | string,
                        transformedProperty as any[] | string
                    );
                }
                Object.assign(built, {
                    [original]: transformedProperty
                });
            }
        }

        this.monster = built as Monster;

        return built;
    }

    getBlocksToTransform(
        blocks: StatblockItem[]
    ): (GroupItem | InlineItem | SavesItem | TraitsItem)[] {
        let ret: (GroupItem | InlineItem | SavesItem | TraitsItem)[] = [];
        for (const block of blocks) {
            switch (block.type) {
                case "group":
                case "inline": {
                    ret.push(...this.getBlocksToTransform(block.nested));
                    break;
                }
                case "saves":
                case "traits": {
                    ret.push(block);
                    break;
                }
                default:
                    continue;
            }
        }
        return ret;
    }

    async init() {
        const statblock = new Statblock({
            target: this.containerEl,
            props: {
                context: this.context,
                monster: this.transform(await this.build()),
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
    transform(monster: Partial<Monster>): Partial<Monster> {
        const extensions = this.getExtensions(monster);

        const ret = Object.assign({}, ...extensions, monster);
        const built = JSON.parse(
            JSON.stringify(ret)
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
        let extensions: Partial<Monster>[] = [fastCopy(monster)];
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
                extensions.push(...this.getExtensions(extensionMonster));
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
