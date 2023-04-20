import type { Monster } from "../index";

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
    "text",
    "ifelse",
    "collapse",
    "javascript",
    "layout"
] as const;

export const TypeNames: Array<
    [typeof StatblockItemTypes[number] | null, string]
> = [
    ["group", "Group"],
    ["inline", "Inline Group"],
    ["ifelse", "If/Else"],
    ["collapse", "Collapsible"],
    ["javascript", "JavaScript"],
    ["layout", "Layout"],
    [null, "separator"],
    ["heading", "Heading"],
    ["image", "Image"],
    ["property", "Property Line"],
    ["saves", "Saves"],
    ["spells", "Spells"],
    ["subheading", "Subheading"],
    ["table", "Table"],
    ["text", "Text"],
    ["traits", "Traits"]
];

export type StatblockItemType = typeof StatblockItemTypes[number];

type RequiredProps = {
    type: StatblockItemType;
    conditioned?: boolean;
    id: string;
};

export type CommonProps = RequiredProps & {
    properties: Array<keyof Monster>;
    fallback?: string;
    hasRule?: boolean;
    dice?: boolean;
    diceProperty?: keyof Monster;
    diceText?: string;
    diceCallback?: string;
    doNotAddClass?: boolean;
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
    heading?: string;
    headingProp?: boolean;
    nested: StatblockItem[];
    cls?: string;
};
type HeadingProps = {
    type: "heading";
    size: number;
};
type InlineProps = {
    type: "inline";
    heading?: string;
    headingProp?: boolean;
    nested: StatblockItem[];
    cls?: string;
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
    heading?: string;
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
    subheadingText?: string;
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
export type IfElseCondition = {
    condition: string;
    nested: [GroupItem];
};
type IfElseProps = {
    type: "ifelse";
    conditions: IfElseCondition[];
};
type CollapseProps = {
    type: "collapse";
    nested: [GroupItem];
    heading?: string;
    hasRule?: boolean;
    open: boolean;
};
type JavaScriptProps = {
    type: "javascript";
    code: string;
};
type LayoutProps = {
    type: "layout";
    layout: string;
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
export type IfElseItem = RequiredProps & IfElseProps;
export type CollapseItem = RequiredProps & CollapseProps;
export type JavaScriptItem = RequiredProps & JavaScriptProps;
export type LayoutItem = RequiredProps & LayoutProps;

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
    | TextItem
    | IfElseItem
    | CollapseItem
    | JavaScriptItem
    | LayoutItem;

export type MarkdownableItem = Exclude<
    StatblockItem,
    LayoutItem | JavaScriptItem | IfElseItem | CollapseItem
>;
export type NestableItem<T> = T extends { nested: StatblockItem[] } ? T : never;
export type AdvancedItem =
    | GroupItem
    | InlineItem
    | IfElseItem
    | CollapseItem
    | JavaScriptItem
    | LayoutItem;
export type BasicItem = Exclude<StatblockItem, AdvancedItem>;

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
    ifelse: IfElseItem;
    javascript: JavaScriptItem;
    collapse: CollapseItem;
}

export interface Layout {
    name: string;
    id: string;
    blocks: StatblockItem[];
}

export interface DefaultLayout extends Layout {
    edited?: boolean;
}
