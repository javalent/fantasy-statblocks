import fastCopy from "fast-copy";
import type { Monster } from "index";
import type StatBlockPlugin from "src/main";
import { Watcher } from "src/watcher/watcher";
import { BESTIARY_BY_NAME } from "./srd-bestiary";

class BestiaryClass {
    #bestiary: Map<string, Monster> = new Map();
    #local: Map<string, Monster> = new Map();
    #ephemeral: Map<string, Monster> = new Map();

    #resolved = false;
    #resolveCallbacks: Array<() => void> = [];
    #updatedCallbacks: Array<() => void> = [];

    enableSRD: boolean;

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

        plugin.registerEvent(
            plugin.app.workspace.on("fantasy-statblocks:srd-change", (srd) => {
                this.enableSRD = srd;
                if (srd) {
                    this.#bestiary = new Map([
                        ...BESTIARY_BY_NAME,
                        ...this.#bestiary
                    ]);
                } else {
                    this.#bestiary = new Map([
                        ...this.#local,
                        ...this.#ephemeral
                    ]);
                }
            })
        );
        this.enableSRD = !plugin.settings.disableSRD;
        if (this.enableSRD) {
            this.#bestiary = new Map(BESTIARY_BY_NAME);
        }
        for (const [, monster] of plugin.settings.monsters) {
            this.addLocalCreature(monster);
        }
    }

    isLocal(name: string) {
        return (
            this.#local.has(name) &&
            this.#bestiary.get(name) === this.#local.get(name)
        );
    }
    addLocalCreature(monster: Monster) {
        this.#local.set(monster.name, monster);
        this.#bestiary.set(monster.name, monster);
        this.#triggerUpdatedCallbacks();
    }
    removeLocalCreature(name: string) {
        if (
            this.#bestiary.has(name) &&
            this.#bestiary.get(name) === this.#local.get(name)
        ) {
            this.#bestiary.delete(name);
        }
        this.#local.delete(name);
        if (this.#ephemeral.has(name)) {
            this.#bestiary.set(name, this.#ephemeral.get(name));
        } else if (this.enableSRD && BESTIARY_BY_NAME.has(name)) {
            this.#bestiary.set(name, BESTIARY_BY_NAME.get(name));
        }
        this.#triggerUpdatedCallbacks();
    }
    addEphemeralCreature(creature: Monster) {
        this.#bestiary.set(creature.name, creature);
        this.#ephemeral.set(creature.name, creature);
        this.#triggerUpdatedCallbacks();
    }
    removeEphemeralCreature(name: string) {
        this.#bestiary.delete(name);
        this.#ephemeral.delete(name);
        this.#triggerUpdatedCallbacks();
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
    onUpdated(callback: () => void) {
        this.#updatedCallbacks.push(callback);
    }

    #triggerUpdatedCallbacks() {
        if (this.isResolved()) {
            for (const callback of this.#updatedCallbacks) {
                callback();
            }
        }
    }
    size() {
        return this.#bestiary.size;
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
        return Array.from(this.#bestiary.keys()).sort();
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
