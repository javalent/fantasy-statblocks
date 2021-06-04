import { MarkdownPostProcessorContext, Plugin } from "obsidian";

export declare abstract class StatblockMonsterPlugin extends Plugin {
    data: Map<string, Monster>;
    abstract postprocessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ): Promise<void>;
    get sorted(): Monster[];
    get sources(): Set<string>;
    abstract saveMonster(monster: Monster): Promise<void>;
    abstract saveMonsters(monsters: Monster[]): Promise<void>;
    abstract deleteMonster(monster: string): Promise<void>;
}

export type ability =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";

export interface Monster {
    name: string;
    size: string;
    type: string;
    subtype: string;
    alignment: string;
    ac: number;
    hp: number;
    hit_dice?: string;
    speed: string;
    stats: [number, number, number, number, number, number];
    saves?: { [K in ability]?: number }[];
    skillsaves?: { [key: string]: number }[];
    damage_vulnerabilities: string;
    damage_resistances: string;
    damage_immunities: string;
    condition_immunities: string;
    senses: string;
    languages: string;
    cr: string | number;
    traits?: Trait[];
    spells?: Spell[];
    actions?: Trait[];
    legendary_actions?: Trait[];
    reactions?: Trait[];
    monster?: string;
    source?: string;
}

/* export interface StatblockMonster
    extends Omit<
        Monster,
        "traits" | "actions" | "legendary_actions" | "reactions"
    > {
    traits: Map<string, Trait>;
    actions: Map<string, Trait>;
    legendary_actions: Map<string, Trait>;
    reactions: Map<string, Trait>;
    monster?: string;
} */

export type Spell = string | { [key: string]: string };

export interface Trait {
    name: string;
    desc: string;
    [key: string]: any;
}
