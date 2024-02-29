import fastCopy from "fast-copy";
import type { Monster } from "index";
import type { HomebrewCreature } from "obsidian-overload";
import type StatBlockPlugin from "src/main";
import StatBlockRenderer from "src/view/statblock";

export class API {
    #changed: boolean = true;
    #creatures: Monster[];
    #names: string[];
    #plugin: StatBlockPlugin;
    constructor(plugin: StatBlockPlugin) {
        this.#plugin = plugin;
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
        return this.#plugin.bestiary;
    }

    /**
     * Get a list of bestiary creatures.
     *
     * @returns {Monster[]}
     */
    getBestiaryCreatures(): Monster[] {
        if (this.#changed) {
            this.#creatures = [];
            for (const creature of this.#plugin.bestiary.values()) {
                if (creature.bestiary !== false) {
                    this.#creatures.push(creature);
                }
            }
            this.#changed = false;
        }
        return this.#creatures;
    }

    /**
     * Get a list of bestiary names.
     *
     * @returns {string[]}
     */
    getBestiaryNames(): string[] {
        if (this.#changed) {
            this.#names = [];
            for (const creature of this.#plugin.bestiary.values()) {
                if (creature.bestiary !== false) {
                    this.#names.push(creature.name);
                }
            }
            this.#changed = false;
        }
        return this.#names;
    }

    /**
     * Returns true if the bestiary contains the creature.
     *
     * @param {string} name
     * @returns {boolean}
     */
    hasCreature(name: string): boolean {
        return this.#plugin.bestiary.has(name);
    }

    getExtensions(
        monster: Partial<Monster>,
        extended: Set<string>
    ): Partial<Monster>[] {
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
                if (extended.has(extension)) {
                    console.info(
                        "Circular extend dependency detected in " +
                            [...extended]
                    );
                    continue;
                }
                extended.add(monster.name);
                const extensionMonster = this.#plugin.bestiary.get(extension);
                if (!extensionMonster) continue;
                extensions.push(
                    ...this.getExtensions(extensionMonster, extended)
                );
            }
        }

        return extensions;
    }

    /**
     * Retrieve a fully defined creature out of the bestiary, resolving all extensions.
     *
     * @param {string} name Name of the creautre to retrieve.
     * @returns {Partial<Monster> | null} The creature from the bestiary, or null if not present.
     */
    getCreatureFromBestiary(name: string): Partial<Monster> | null {
        if (!this.#plugin.bestiary.has(name)) return null;
        let monster = this.#plugin.bestiary.get(name);
        return Object.assign(
            {},
            ...this.getExtensions(monster, new Set(monster.name)),
            monster
        ) as Monster;
    }

    render(creature: HomebrewCreature, el: HTMLElement, display?: string) {
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
