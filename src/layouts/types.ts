import type { Monster } from "@types";

export const StatblockItemTypes = [
    "traits",
    "heading",
    "subheading",
    "property",
    "table",
    "saves",
    "spells",
    "inline",
    "group",
    "image",
    "text"
] as const;

export const TypeNames: Array<[typeof StatblockItemTypes[number], string]> = [
    ["group", "Group"],
    ["heading", "Heading"],
    ["image", "Image"],
    ["inline", "Inline Group"],
    ["property", "Property Line"],
    ["saves", "Saves"],
    ["spells", "Spells"],
    ["subheading", "Subheading"],
    ["table", "Table"],
    ["text", "Text"],
    ["traits", "Traits"]
];

export type StatblockItemType = typeof StatblockItemTypes[number];

export type CommonProps = {
    type: StatblockItemType;
    id: string;
    properties: Array<keyof Monster>;
    conditioned?: boolean;
    fallback?: string;
    hasRule?: boolean;
    dice?: boolean;
    diceProperty?: keyof Monster;
    diceText?: string;
    diceCallback?: string;
};

export const MarkdownTypes = [
    "property",
    "traits",
    "spells",
    "text",
    "saves"
] as const;

type GenericTextProp = {
    markdown?: boolean;
};

type GroupProps = {
    type: "group";
    nested: StatblockItem[];
};
type HeadingProps = {
    type: "heading";
    size: number;
};
type InlineProps = {
    type: "inline";
    nested: StatblockItem[];
};
type PropertyProps = {
    type: "property";
    callback?: string;
    display?: string;
};
type SavesProps = {
    type: "saves";
    display?: string;
};
type SpellsProps = {
    type: "spells";
};
type SubHeadingProps = {
    type: "subheading";
    separator?: string;
};
type TableProps = {
    type: "table";
    headers: string[];
    calculate: boolean;
    modifier?: string;
};
type TraitsProps = {
    type: "traits";
    heading?: string;
    headingProp?: boolean;
};
type ImageProps = {
    type: "image";
    heading?: string;
};
type TextProps = {
    type: "text";
    heading?: string;
    headingProp?: boolean;
    text: string;
};

export type GroupItem = CommonProps & GroupProps;
export type HeadingItem = CommonProps & HeadingProps;
export type InlineItem = CommonProps & InlineProps;
export type PropertyItem = CommonProps & PropertyProps & GenericTextProp;
export type SavesItem = CommonProps & SavesProps & GenericTextProp;
export type TraitsItem = CommonProps & TraitsProps & GenericTextProp;
export type SpellsItem = CommonProps & SpellsProps & GenericTextProp;
export type SubHeadingItem = CommonProps & SubHeadingProps;
export type TableItem = CommonProps & TableProps;
export type ImageItem = CommonProps & ImageProps;
export type TextItem = CommonProps & TextProps & GenericTextProp;

export type StatblockItem =
    | GroupItem
    | HeadingItem
    | InlineItem
    | PropertyItem
    | SavesItem
    | TraitsItem
    | SpellsItem
    | SubHeadingItem
    | TableItem
    | ImageItem
    | TextItem;

export interface StatblockItemMap
    extends Record<typeof StatblockItemTypes[number], StatblockItem> {
    group: GroupItem;
    heading: HeadingItem;
    inline: InlineItem;
    property: PropertyItem;
    saves: SavesItem;
    traits: TraitsItem;
    spells: SpellsItem;
    subheading: SubHeadingItem;
    table: TableItem;
    image: ImageItem;
    text: TextItem;
}

export interface Layout {
    name: string;
    blocks: StatblockItem[];
}
