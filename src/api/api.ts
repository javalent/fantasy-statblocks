import fastCopy from "fast-copy";
import type { Monster } from "index";
import type { Component } from "obsidian";
import type { HomebrewCreature } from "obsidian-overload";
import { Bestiary } from "src/bestiary/bestiary";
import type StatBlockPlugin from "src/main";
import StatBlockRenderer from "src/view/statblock";
declare global {
    interface Window {
        FantasyStatblocks: API;
    }
}
export class API {
    #changed: boolean = true;
    #plugin: StatBlockPlugin;
    constructor(plugin: StatBlockPlugin) {
        this.#plugin = plugin;
    }

    getVersion(): {
        major: number;
        minor: number;
        patch: number;
    } {
        return this.#plugin.settings.version;
    }

    setChanged(changed: boolean) {
        this.#changed = changed;
    }
    hasChanged() {
        return this.#changed;
    }

    /**
     * Get the fully defined plugin bestiary.
     *
     * @returns {Map<string, Monster>}
     */
    getBestiary() {
        return Bestiary.getBestiary();
    }

    /**
     * Get a list of bestiary creatures.
     *
     * @returns {Monster[]}
     */
    getBestiaryCreatures(): Monster[] {
        return Bestiary.getBestiaryCreatures();
    }

    /**
     * Get a list of bestiary names.
     *
     * @returns {string[]}
     */
    getBestiaryNames(): string[] {
        return Bestiary.getBestiaryNames();
    }

    /**
     * Returns true if the bestiary contains the creature.
     *
     * @param {string} name
     * @returns {boolean}
     */
    hasCreature(name: string): boolean {
        return Bestiary.hasCreature(name);
    }

    /**
     * Retrieve a fully defined creature out of the bestiary, resolving all extensions.
     *
     * @param {string} name Name of the creautre to retrieve.
     * @returns {Partial<Monster> | null} The creature from the bestiary, or null if not present.
     */
    getCreatureFromBestiary(name: string): Partial<Monster> | null {
        return Bestiary.getCreatureFromBestiarySync(name);
    }

    render(
        creature: HomebrewCreature,
        el: HTMLElement,
        display?: string
    ): Component {
        const monster: Monster = Object.assign<
            Partial<Monster>,
            HomebrewCreature
        >(
            {},
            fastCopy(this.getCreatureFromBestiary(creature.name) ?? {}),
            //@ts-ignore
            fastCopy(creature)
        ) as Monster;
        if (!monster) return null;
        if (display) {
            monster.name = display;
        }
        return new StatBlockRenderer({
            container: el,
            monster,
            plugin: this.#plugin,
            context: "STATBLOCK_RENDERER"
        });
    }
}
