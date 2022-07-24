export type ability =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";
export type fage_ability =
    | "accuracy"
    | "communication"
    | "constitution"
    | "dexterity"
    | "fighting"
    | "intelligence"
    | "perception"
    | "strength"
    | "willpower";

export type skillsType = 
    | "acrobatics"
    | "animal handling"
    | "arcana"
    | "athletics"
    | "deception"
    | "history"
    | "insight"
    | "intimidation"
    | "investigation"
    | "medicine"
    | "nature"
    | "perception"
    | "performance"
    | "persuasion"
    | "religion"
    | "slight of hand"
    | "stealth"
    | "survival";

export interface Monster {
    image?: string;
    name: string;
    size: string;
    type: string;
    subtype: string;
    alignment: string;
    ac: number;
    hp: number;
    hit_dice?: string;
    speed?: string;
    stats: [number, number, number, number, number, number];
    fage_stats?: [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
    ];
    saves?: { [K in ability]?: number }[];
    skillsaves?: { [key: string]: number }[];
    damage_vulnerabilities?: string;
    damage_resistances?: string;
    damage_immunities?: string;
    condition_immunities?: string;
    senses?: string;
    languages?: string;
    cr: string | number;
    traits?: Trait[];
    spells?: Spell[];
    actions?: Trait[];
    bonus_actions?: Trait[];
    legendary_actions?: Trait[];
    reactions?: Trait[];
    lair_actions?: Trait[];
    monster?: string;
    creature?: string;
    source?: string;

    /** Fate Core */
    description?: string;
    aspects?: string;
    temporaryAspects?: string;
    stress?: number[];
    consequences?: Trait[];
    skills?: Trait[];
    stunts?: Trait[];
    items?: Trait[];
    extras?: Trait[];

    /** Statblock Parameters */
    export?: boolean;
    dice?: boolean;
    render?: boolean;
    layout?: string;
    statblock?: string;
    columns?: number;
    columnWidth?: number;
    columnHeight?: number;
    forceColumns?: boolean;

    note?: string;
    mtime?: number;
}

export interface Character {
    image?: string;
    name: string;
    gender?: string;
    race?: string;
    class?: string;
    level?: number;
    stats: [number, number, number, number, number, number];
    proficiency_bonus?: number;
    speed?: string;
    inspiration?: string;
    hp?: number;
    max_hp?: number;
    hit_dice?: number;
    saves?: [number, number, number, number, number, number];
    skills?: number[];
    initiative?: number;
    ac?: number;
    vulnerabilities?: string;
    resistances?: string;
    immunities?: string;
    senses?: string;
    proficiencies?: string;
    languages?: string;
    actions?: Trait[];
    bonus_actions?: Trait[];
    reactions?: Trait[];
    inventory?: InventoryItem[];
    traits?: Trait[];
    background?: Background;
    alignment?: string;
    eyes?: string;
    size?: string;
    height?: string;
    faith?: string;
    hair?: string;
    skin?: string;
    age?: string;
    weight?: string;
    personality_traits?: string;
    ideals?: string;
    bonds?: string;
    flaws?: string;
    appearance?: string;
    spells?: Spell[];
    source?: string;
    /** Statblock Parameters */
    export?: boolean;
    dice?: boolean;
    render?: boolean;
    layout?: string;
    statblock?: string;
    columns?: number;
    columnWidth?: number;
    columnHeight?: number;
    forceColumns?: boolean;

    note?: string;
    mtime?: number;
}

export interface StatblockParameters
    extends Omit<
        Monster,
        | "traits"
        | "actions"
        | "bonus_actions"
        | "legendary_actions"
        | "reactions"
    > {
    traits?: { desc: string; name: string }[] | [string, string][];
    actions?: Trait[] | [string, string][];
    bonus_actions?: Trait[] | [string, string][];
    legendary_actions?: Trait[] | [string, string][];
    reactions?: Trait[] | [string, string][];
}

export type Spell = string | { [key: string]: string };

export interface Trait {
    name: string;
    desc: string;
    [key: string]: any;
}

export interface InventoryItem {
    name: string;
    notes?: string;
    weight?: number;
    desc?: string;
}

export interface Background {
    name: string;
    desc: string;
}