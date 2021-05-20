type ability =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";

interface Monster {
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
    skills?: { [key: string]: number }[];
    damage_vulnerabilities: string;
    damage_resistances: string;
    damage_immunities: string;
    condition_immunities: string;
    senses: string;
    languages: string;
    cr: string | number;
    traits?: Trait[];
    actions?: Trait[];
    legendary_actions?: Trait[];
    reactions?: Trait[];
}

interface StatblockMonster
    extends Omit<
        Monster,
        "traits" | "actions" | "legendary_actions" | "reactions"
    > {
    traits: Map<string, Trait>;
    actions: Map<string, Trait>;
    legendary_actions: Map<string, Trait>;
    reactions: Map<string, Trait>;
    monster: string;
}

interface Trait {
    name: string;
    desc: string;
    [key: string]: any;
}
