interface CR {
    cr: string;
    xp: number;
}

export const CR: { [key: string]: CR } = {
    "0": {
        cr: "0",
        xp: 0
    },
    "1/8": {
        cr: "1/8",
        xp: 25
    },
    "1/4": {
        cr: "1/4",
        xp: 50
    },
    "1/2": {
        cr: "1/2",
        xp: 100
    },
    "1": {
        cr: "1",
        xp: 200
    },
    "2": {
        cr: "2",
        xp: 450
    },
    "3": {
        cr: "3",
        xp: 700
    },
    "4": {
        cr: "4",
        xp: 1100
    },
    "5": {
        cr: "5",
        xp: 1800
    },
    "6": {
        cr: "6",
        xp: 2300
    },
    "7": {
        cr: "7",
        xp: 2900
    },
    "8": {
        cr: "8",
        xp: 3900
    },
    "9": {
        cr: "9",
        xp: 5000
    },
    "10": {
        cr: "10",
        xp: 5900
    },
    "11": {
        cr: "11",
        xp: 7200
    },
    "12": {
        cr: "12",
        xp: 8400
    },
    "13": {
        cr: "13",
        xp: 10000
    },
    "14": {
        cr: "14",
        xp: 11500
    },
    "15": {
        cr: "15",
        xp: 13000
    },
    "16": {
        cr: "16",
        xp: 15000
    },
    "17": {
        cr: "17",
        xp: 18000
    },
    "18": {
        cr: "18",
        xp: 20000
    },
    "19": {
        cr: "19",
        xp: 22000
    },
    "20": {
        cr: "20",
        xp: 25000
    },
    "21": {
        cr: "21",
        xp: 33000
    },
    "22": {
        cr: "22",
        xp: 41000
    },
    "23": {
        cr: "23",
        xp: 50000
    },
    "24": {
        cr: "24",
        xp: 62000
    },
    "25": {
        cr: "25",
        xp: 75000
    },
    "26": {
        cr: "26",
        xp: 90000
    },
    "27": {
        cr: "27",
        xp: 105000
    },
    "28": {
        cr: "28",
        xp: 120000
    },
    "29": {
        cr: "29",
        xp: 135000
    },
    "30": {
        cr: "30",
        xp: 155000
    }
};

export const DiceBySize: { [key: string]: number } = {
    tiny: 4,
    small: 6,
    medium: 8,
    large: 10,
    huge: 12,
    gargantuan: 20
};

export const AbilityAliases: { [key: string]: string } = {
    str: "Str",
    strength: "Str",

    dex: "Dex",
    dexterity: "Dex",

    con: "Con",
    constitution: "Con",

    int: "Int",
    intelligence: "Int",

    wis: "Wis",
    wisdom: "Wis",

    cha: "Cha",
    charisma: "Cha"
};

export const SAVE_ICON = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="save" class="svg-inline--fa fa-save fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM272 80v80H144V80h128zm122 352H54a6 6 0 0 1-6-6V86a6 6 0 0 1 6-6h42v104c0 13.255 10.745 24 24 24h176c13.255 0 24-10.745 24-24V83.882l78.243 78.243a6 6 0 0 1 1.757 4.243V426a6 6 0 0 1-6 6zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 128c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40z"></path></svg>`;
export const SAVE_SYMBOL = Symbol("save");
