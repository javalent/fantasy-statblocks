import fastCopy from "fast-copy";
import type { Monster } from "index";
import type StatBlockPlugin from "src/main";
import { Watcher } from "src/watcher/watcher";

class BestiaryClass {
    #bestiary: Map<string, Monster> = new Map();
    #local: Map<string, Monster> = new Map();
    #resolved = false;
    #resolveCallbacks: Array<() => void> = [];
    initialize(plugin: StatBlockPlugin) {
        Watcher.initialize(plugin).load();
        plugin.addCommand({
            id: "parse-frontmatter",
            name: "Parse Frontmatter for Creatures",
            callback: () => {
                Watcher.start(true);
            }
        });
        plugin.register(() => Watcher.unload());

        for (const [name, monster] of plugin.settings.monsters) {
            this.#bestiary.set(name, monster);
            this.#local.set(name, monster);
        }
    }

    isLocal(name: string) {
        return this.#local.has(name);
    }

    isResolved() {
        return this.#resolved;
    }
    setResolved() {
        this.#resolved = true;
        for (const callback of this.#resolveCallbacks) {
            callback();
        }
    }
    onResolved(callback: () => void) {
        if (this.isResolved()) {
            callback();
        } else {
            this.#resolveCallbacks.push(callback);
        }
    }

    /**
     * Get the fully defined plugin bestiary.
     *
     * @returns {Map<string, Monster>}
     */
    getBestiary() {
        return this.#bestiary;
    }

    /**
     * Get a list of bestiary creatures.
     *
     * @returns {Monster[]}
     */
    getBestiaryCreatures(): Monster[] {
        return Array.from(this.#bestiary.values());
    }

    /**
     * Get a list of bestiary names.
     *
     * @returns {string[]}
     */
    getBestiaryNames(): string[] {
        return Array.from(this.#bestiary.keys());
    }

    addCreature(creature: Monster) {
        this.#bestiary.set(creature.name, creature);
    }

    /**
     * Returns true if the bestiary contains the creature.
     *
     * @param {string} name
     * @returns {boolean}
     */
    hasCreature(name: string): boolean {
        return this.#bestiary.has(name);
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
                const extensionMonster = this.#bestiary.get(extension);
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
    async getCreatureFromBestiary(
        name: string
    ): Promise<Partial<Monster> | null> {
        return new Promise((resolve) => {
            this.onResolved(() => {
                if (!this.hasCreature(name)) resolve(null);
                let monster = this.#bestiary.get(name);
                resolve(
                    Object.assign(
                        {},
                        ...this.getExtensions(monster, new Set(monster.name)),
                        monster
                    ) as Monster
                );
            });
        });
    }
    /**
     * Retrieve a fully defined creature out of the bestiary, resolving all extensions.
     *
     * @param {string} name Name of the creautre to retrieve.
     * @returns {Partial<Monster> | null} The creature from the bestiary, or null if not present.
     */
    getCreatureFromBestiarySync(name: string): Partial<Monster> | null {
        if (!this.isResolved())
            throw new Error("The bestiary is not fully resolved.");
        if (!this.hasCreature(name)) return null;
        let monster = this.#bestiary.get(name);
        return Object.assign(
            {},
            ...this.getExtensions(monster, new Set(monster.name)),
            monster
        ) as Monster;
    }

    //temp
    get(name: string) {
        return this.#bestiary.get(name);
    }
}

export const Bestiary = new BestiaryClass();
