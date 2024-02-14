import type {
    DefaultLayout,
    ItemWithProperties,
    Layout,
    StatblockItem
} from "types/layout";
import { Layout5e } from "./basic 5e/basic5e";
import type { StatblockData } from "obsidian-overload";

export default class LayoutManager {
    public initialize(settings: StatblockData) {
        this.setDefaultLayout(settings.default);
        this.setDefaultLayouts(settings.defaultLayouts);
        this.setLayouts(settings.layouts);
    }
    #default: string;
    #defaults: Map<string, DefaultLayout> = new Map();

    /**
     *
     * @param old ID of the old layout to be updated.
     * @param layout New Layout definition.
     */
    public updateDefaultLayout(old: string, layout: DefaultLayout) {
        this.#defaults.delete(old);
        this.setDefaultLayouts([layout]);
    }
    /**
     * @param layout ID of the layout to be removed.
     */
    public removeDefaultLayout(layout: string) {
        this.#defaults.delete(layout);
    }
    /**
     * @param layout Layout to be added.
     */
    public addDefaultLayout(layout: DefaultLayout) {
        this.setDefaultLayouts([layout]);
    }

    public setDefaultLayouts(layouts: DefaultLayout[]) {
        for (const layout of layouts) {
            this.#defaults.set(layout.id, layout);
        }
        setTimeout(() => {
            for (const layout of layouts) {
                this.#unwrapLayout(layout);
            }
        }, 0);
    }
    public setDefaultLayout(layout: string) {
        this.#default = layout;
    }
    public getDefaultLayout() {
        return this.#layouts?.get(this.#default) ?? Layout5e;
    }
    #layouts: Map<string, Layout> = new Map();
    public setLayouts(layouts: Layout[]) {
        for (const layout of layouts) {
            this.#layouts.set(layout.id, layout);
        }
        setTimeout(() => {
            for (const layout of layouts) {
                this.#unwrapLayout(layout);
            }
        }, 0);
    }
    public getCustomLayouts() {
        return this.#layouts.values();
    }
    public getAllLayouts() {
        return [...this.#defaults.values(), ...this.#layouts.values()].filter(
            (f) => !("removed" in f) || !f.removed
        );
    }
    public getLayout(id: string): Layout | null {
        return this.#layouts.get(id) ?? this.#defaults.get(id) ?? null;
    }
    public getLayoutOrDefault(name: string) {
        return (
            this.getAllLayouts().find((l) => l.name == name) ??
            this.getDefaultLayout()
        );
    }

    /**
     *
     * @param old ID of the old layout to be updated.
     * @param layout New Layout definition.
     */
    public updateLayout(old: string, layout: Layout) {
        this.#layouts.delete(old);
        this.setLayouts([layout]);
    }
    /**
     * @param layout ID of the layout to be removed.
     */
    public removeLayout(layout: string) {
        this.#layouts.delete(layout);
    }
    /**
     * @param layout Layout to be added.
     */
    public addLayout(layout: Layout) {
        this.setLayouts([layout]);
    }

    public getSortedLayoutNames() {
        const names = new Set([this.getDefaultLayout().name]);
        for (const layout of this.getAllLayouts()) {
            if (names.has(layout.name)) continue;
            names.add(layout.name);
        }
        return [...names];
    }

    #PROPERTY_MAP: WeakMap<Layout, Map<string, ItemWithProperties>> =
        new WeakMap();
    public getProperties(layout: string): Map<string, ItemWithProperties>;
    public getProperties(layout: Layout): Map<string, ItemWithProperties>;
    public getProperties(
        layout: Layout | string
    ): Map<string, ItemWithProperties> {
        const _layout =
            typeof layout === "string" ? this.getLayout(layout) : layout;
        return this.#PROPERTY_MAP.get(_layout);
    }
    #unwrapLayout(layout: Layout) {
        const map: Map<string, ItemWithProperties> = new Map();
        this.#PROPERTY_MAP.set(layout, this.#unwrapBlocks(layout.blocks, map));
    }
    #unwrapBlocks(
        blocks: StatblockItem[],
        map: Map<string, ItemWithProperties>
    ): Map<string, ItemWithProperties> {
        for (const block of blocks) {
            if ("nested" in block) {
                this.#unwrapBlocks(block.nested, map);
                continue;
            }
            if ("properties" in block) {
                for (const prop of block.properties) {
                    map.set(prop, block);
                }
            }
        }
        return map;
    }
}
