import type { Monster } from "../../index";

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
    "layout",
    "action"
] as const;

export const TypeNames: Array<[(typeof StatblockItemTypes)[number], string]> = [
    ["group", "Group"],
    ["inline", "Inline Group"],
    ["ifelse", "If/Else"],
    ["collapse", "Collapsible"],
    ["javascript", "JavaScript"],
    ["layout", "Layout"],
    ["action", "Action"],
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

export type StatblockItemType = (typeof StatblockItemTypes)[number];

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
    callback?: string;
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
    callback?: string;
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

type ActionProps = {
    type: "action";
    action?: string;
    callback?: string;
    icon?: string;
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

export type ActionItem = RequiredProps & ActionProps;
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
    | LayoutItem
    | ActionItem;

export type MarkdownableItem = Exclude<
    StatblockItem,
    LayoutItem | JavaScriptItem | IfElseItem | CollapseItem | ActionItem
>;
export type NestableItem<T> = T extends { nested: StatblockItem[] } ? T : never;
export type AdvancedItem =
    | GroupItem
    | InlineItem
    | IfElseItem
    | CollapseItem
    | JavaScriptItem
    | LayoutItem
    | ActionItem;
export type BasicItem = Exclude<StatblockItem, AdvancedItem>;

export type ItemWithProperties = Exclude<CommonProps, GroupItem | InlineItem>;

export interface StatblockItemMap
    extends Record<(typeof StatblockItemTypes)[number], StatblockItem> {
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
    diceParsing?: DiceParsing[];
    cssProperties?: Partial<LayoutCSSProperties>;
    blocks: StatblockItem[];
}

export interface DefaultLayout extends Layout {
    edited?: boolean;
    removed?: boolean;
    version?: number;
    updatable?: boolean;
}

export type DiceParsing = {
    regex: string;
    parser: string;
    id: string;
    desc?: string;
};

export type DiceParser = () => ParsedDice[];

export type ParsedDice = string | { text: string; original: string };

export const CSSProperties = [
    /**
     * Basic Info
     */
    "primaryColor",
    "ruleColor",
    "backgroundColor",
    "borderSize",
    "borderColor",

    /**
     * Bar
     */
    "barColor",
    "barBorderSize",
    "barBorderColor",

    /**
     * Image
     */
    "imageWidth",
    "imageHeight",
    "imageBorderSize",
    "imageBorderColor",

    /**
     * Box Shadow
     */
    "boxShadowColor",
    "boxShadowXOffset",
    "boxShadowYOffset",
    "boxShadowBlur",

    /**
     * Basic Font
     */
    "fontColor",
    "fontWeight",
    "contentFont",
    "contentFontSize",

    /**
     * Headings
     */
    "headingFont",
    "headingFontColor",
    "headingFontSize",
    "headingFontVariant",
    "headingFontWeight",

    /**
     * Properties
     */
    "propertyFont",
    "propertyFontColor",
    "propertyFontVariant",
    "propertyFontSize",
    "propertyFontWeight",
    "propertyNameFont",
    "propertyNameFontVariant",
    "propertyNameFontSize",
    "propertyNameFontColor",
    "propertyNameFontWeight",

    /**
     * Section Headings
     */
    "sectionHeadingBorderSize",
    "sectionHeadingBorderColor",
    "sectionHeadingFont",
    "sectionHeadingFontColor",
    "sectionHeadingFontSize",
    "sectionHeadingFontVariant",
    "sectionHeadingFontWeight",

    /**
     * Subheadings
     */
    "subheadingFont",
    "subheadingFontColor",
    "subheadingFontSize",
    "subheadingFontStyle",
    "subheadingFontWeight",

    /**
     * Traits
     */
    "traitsFont",
    "traitsFontColor",
    "traitsFontSize",
    "traitsFontWeight",
    "traitsFontStyle"
] as const;
export type CSSProperties = (typeof CSSProperties)[number];
export type LayoutCSSProperties = Record<
    (typeof CSSProperties)[number],
    string | null
> & {
    [ThemeMode.Dark]?: Partial<
        Record<(typeof CSSProperties)[number], string | null>
    >;
    [ThemeMode.Light]?: Partial<
        Record<(typeof CSSProperties)[number], string | null>
    >;
};

export const DefaultLayoutCSSProperties: LayoutCSSProperties = {
    primaryColor: "#7a200d",
    ruleColor: "#922610",
    backgroundColor: "#fdf1dc",
    borderSize: "1px",
    borderColor: "#ddd",
    barColor: "#e69a28",
    barBorderSize: "1px",
    barBorderColor: "#000",
    imageWidth: "75px",
    imageHeight: "75px",
    imageBorderSize: "2px",
    imageBorderColor: "primaryColor",
    boxShadowColor: "#ddd",
    boxShadowXOffset: "0",
    boxShadowYOffset: "0",
    boxShadowBlur: "1.5em",
    fontColor: "primaryColor",
    fontWeight: "700",
    contentFont: `"Noto Sans", "Myriad Pro", Calibri, Helvetica, Arial, sans-serif`,
    contentFontSize: "14px",
    headingFont: `"Libre Baskerville", "Lora", "Calisto MT", "Bookman Old Style", Bookman, "Goudy Old Style", Garamond, "Hoefler Text", "Bitstream Charter", Georgia, serif`,
    headingFontColor: "fontColor",
    headingFontSize: "23px",
    headingFontVariant: "small-caps",
    headingFontWeight: "fontWeight",
    propertyFont: "contentFont",
    propertyNameFontColor: "fontColor",
    propertyNameFontWeight: "bold",
    sectionHeadingBorderSize: "1px",
    sectionHeadingBorderColor: "primaryColor",
    sectionHeadingFontColor: "fontColor",
    sectionHeadingFontSize: "21px",
    sectionHeadingFontVariant: "small-caps",
    sectionHeadingFontWeight: "normal",
    subheadingFontSize: "12px",
    subheadingFontStyle: "italic",
    subheadingFontWeight: "normal",
    traitsFontWeight: "bold",
    traitsFontStyle: "italic",
    propertyFontColor: null,
    propertyFontVariant: null,
    propertyFontSize: null,
    propertyFontWeight: null,
    propertyNameFont: null,
    propertyNameFontVariant: null,
    propertyNameFontSize: null,
    sectionHeadingFont: null,
    subheadingFont: null,
    subheadingFontColor: null,
    traitsFont: null,
    traitsFontColor: null,
    traitsFontSize: null
};

export const ThemeMode = {
    Light: "moonstone",
    Dark: "obsidian",
    None: "none"
} as const;
export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];

export function resolutionTree(
    properties: Partial<LayoutCSSProperties>,
    property: CSSProperties,
    mode: ThemeMode
) {
    let seen = new Set();
    let prop = resolveRawProperty(properties, property, mode);
    while (CSSProperties.includes(prop as CSSProperties)) {
        //derived...
        if (seen.has(prop as CSSProperties)) {
            break;
        }
        seen.add(prop);
        prop = resolveRawProperty(properties, prop as CSSProperties, mode);
    }
    return seen;
}
export function isDerived(
    properties: Partial<LayoutCSSProperties>,
    property: CSSProperties,
    mode: ThemeMode
): boolean {
    let prop = resolveRawProperty(properties, property, mode);
    console.log("🚀 ~ file: layout.types.ts:450 ~ prop:", property, prop);

    return prop != null && CSSProperties.includes(prop as CSSProperties);
}

export function resolveRawProperty(
    properties: Partial<LayoutCSSProperties>,
    property: CSSProperties,
    mode: ThemeMode
) {
    return (
        (mode != ThemeMode.None ? properties?.[mode]?.[property] : null) ??
        properties?.[property] ??
        DefaultLayoutCSSProperties[property] ??
        null
    );
}
export function resolveProperty(
    properties: Partial<LayoutCSSProperties>,
    property: CSSProperties,
    mode: ThemeMode,
    seen: Set<CSSProperties> = new Set()
): string | null {
    seen.add(property);

    let prop = resolveRawProperty(properties, property, mode);
    if (CSSProperties.includes(prop as CSSProperties)) {
        //derived...
        if (seen.has(prop as CSSProperties)) return null;
        return resolveProperty(properties, prop as CSSProperties, mode, seen);
    }
    return prop;
}

export const CSSPropertyType = Object.freeze({
    Number: "Number",
    Color: "Color",
    Font: "Font",
    Size: "Size",
    Style: "Style",
    Variant: "Variant",
    Weight: "Weight"
});

export type CSSPropertyType =
    (typeof CSSPropertyType)[keyof typeof CSSPropertyType];

export type CSSPropertyDefinition = {
    property: CSSProperties;
    name: string;
    desc?: string;
    type: CSSPropertyType;
};

export type CSSPropertyGroup = {
    name: string;
    desc: string;
    properties: CSSPropertyDefinition[];
};

export const CSSPropertyGroups: CSSPropertyGroup[] = [
    {
        name: "General",
        desc: "",
        properties: [
            {
                type: CSSPropertyType.Color,
                property: "primaryColor",
                desc: "This is used to derive several other properties by default.",
                name: "Primary color"
            },
            {
                type: CSSPropertyType.Color,
                property: "ruleColor",
                name: "Rule color"
            },
            {
                type: CSSPropertyType.Color,
                property: "backgroundColor",
                name: "Background color"
            },
            {
                type: CSSPropertyType.Color,
                property: "borderColor",
                name: "Border color"
            },
            {
                type: CSSPropertyType.Size,
                property: "borderSize",
                name: "Border size"
            }
        ]
    },
    {
        name: "Content font",
        desc: "",
        properties: [
            {
                type: CSSPropertyType.Font,
                name: "Content font",
                desc: "This is the font used for most of the content in a statblock.",
                property: "contentFont"
            },
            {
                type: CSSPropertyType.Size,
                name: "Content font size",
                property: "contentFontSize"
            },
            {
                type: CSSPropertyType.Weight,
                name: "Content font weight",
                property: "fontWeight"
            },
            {
                type: CSSPropertyType.Color,
                name: "Content font color",
                property: "fontColor"
            }
        ]
    },
    {
        name: "Bar",
        desc: "Control the appearance of the top and bottom bars.",
        properties: [
            {
                type: CSSPropertyType.Color,
                name: "Bar color",
                property: "barColor"
            },
            {
                type: CSSPropertyType.Color,
                name: "Bar border color",
                property: "barBorderColor"
            },
            {
                type: CSSPropertyType.Size,
                name: "Bar border size",
                property: "barBorderSize"
            }
        ]
    },
    {
        name: "Images",
        desc: "",
        properties: [
            {
                type: CSSPropertyType.Size,
                name: "Image width",
                property: "imageWidth"
            },
            {
                type: CSSPropertyType.Size,
                name: "Image height",
                property: "imageHeight"
            },
            {
                type: CSSPropertyType.Size,
                name: "Image border size",
                property: "imageBorderSize"
            },
            {
                type: CSSPropertyType.Color,
                name: "Image border color",
                property: "imageBorderColor"
            }
        ]
    },
    {
        name: "Shadow",
        desc: "",
        properties: [
            {
                type: CSSPropertyType.Color,
                name: "Shadow color",
                property: "boxShadowColor"
            },
            {
                type: CSSPropertyType.Size,
                name: "Shadow x offset",
                property: "boxShadowXOffset"
            },
            {
                type: CSSPropertyType.Size,
                name: "Shadow y offset",
                property: "boxShadowYOffset"
            },
            {
                type: CSSPropertyType.Size,
                name: "Shadow blur",
                property: "boxShadowBlur"
            }
        ]
    },
    {
        name: "Headings",
        desc: "Anything related to heading blocks.",
        properties: [
            {
                type: CSSPropertyType.Font,
                property: "headingFont",
                name: "Heading font"
            },
            {
                type: CSSPropertyType.Color,
                property: "headingFontColor",
                name: "Heading font color"
            },
            {
                type: CSSPropertyType.Size,
                property: "headingFontSize",
                name: "Heading font size"
            },
            {
                type: CSSPropertyType.Variant,
                property: "headingFontVariant",
                name: "Heading font variant"
            },
            {
                type: CSSPropertyType.Weight,
                property: "headingFontWeight",
                name: "Heading font weight"
            }
        ]
    },
    {
        name: "Properties",
        desc: "Anything related to property blocks.",
        properties: [
            {
                type: CSSPropertyType.Font,
                property: "propertyFont",
                name: "Property font"
            },
            {
                type: CSSPropertyType.Color,
                property: "propertyFontColor",
                name: "Property font color"
            },
            {
                type: CSSPropertyType.Size,
                property: "propertyFontSize",
                name: "Property font size"
            },
            {
                type: CSSPropertyType.Variant,
                property: "propertyFontVariant",
                name: "Property font variant"
            },
            {
                type: CSSPropertyType.Weight,
                property: "propertyFontWeight",
                name: "Property font weight"
            },
            {
                type: CSSPropertyType.Font,
                property: "propertyNameFont",
                name: "Property heading font"
            },
            {
                type: CSSPropertyType.Color,
                property: "propertyNameFontColor",
                name: "Property name font color"
            },
            {
                type: CSSPropertyType.Size,
                property: "propertyNameFontSize",
                name: "Property name font size"
            },
            {
                type: CSSPropertyType.Variant,
                property: "propertyNameFontVariant",
                name: "Property name font variant"
            },
            {
                type: CSSPropertyType.Weight,
                property: "propertyNameFontWeight",
                name: "Property name font weight"
            }
        ]
    },
    {
        name: "Section headings",
        desc: "Anything related to section heading blocks.",
        properties: [
            {
                type: CSSPropertyType.Font,
                property: "sectionHeadingFont",
                name: "Section heading font"
            },
            {
                type: CSSPropertyType.Color,
                property: "sectionHeadingFontColor",
                name: "Section heading font color"
            },
            {
                type: CSSPropertyType.Size,
                property: "sectionHeadingFontSize",
                name: "Section heading font size"
            },
            {
                type: CSSPropertyType.Variant,
                property: "sectionHeadingFontVariant",
                name: "Section heading font variant"
            },
            {
                type: CSSPropertyType.Weight,
                property: "sectionHeadingFontWeight",
                name: "Section heading font weight"
            },
            {
                type: CSSPropertyType.Size,
                property: "sectionHeadingBorderSize",
                name: "Section heading border size"
            },
            {
                type: CSSPropertyType.Color,
                property: "sectionHeadingBorderColor",
                name: "Section heading border color"
            }
        ]
    },
    {
        name: "Subheadings",
        desc: "",
        properties: [
            {
                type: CSSPropertyType.Font,
                property: "subheadingFont",
                name: "Subheading font"
            },
            {
                type: CSSPropertyType.Color,
                property: "subheadingFontColor",
                name: "Subheading font color"
            },
            {
                type: CSSPropertyType.Size,
                property: "subheadingFontSize",
                name: "Subheading font size"
            },
            {
                type: CSSPropertyType.Style,
                property: "subheadingFontStyle",
                name: "Subheading font style"
            },
            {
                type: CSSPropertyType.Weight,
                property: "subheadingFontWeight",
                name: "Subheading font weight"
            }
        ]
    },
    {
        name: "Traits",
        desc: "",
        properties: [
            {
                type: CSSPropertyType.Font,
                property: "traitsFont",
                name: "Traits font"
            },
            {
                type: CSSPropertyType.Color,
                property: "traitsFontColor",
                name: "Traits font color"
            },
            {
                type: CSSPropertyType.Size,
                property: "traitsFontSize",
                name: "Traits font size"
            },
            {
                type: CSSPropertyType.Style,
                property: "traitsFontStyle",
                name: "Traits font style"
            },
            {
                type: CSSPropertyType.Weight,
                property: "traitsFontWeight",
                name: "Traits font weight"
            }
        ]
    }
];

export const PropertiesByType: Map<
    CSSPropertyType,
    Array<CSSPropertyDefinition>
> = new Map();

for (const group of CSSPropertyGroups) {
    for (const property of group.properties) {
        if (!PropertiesByType.has(property.type)) {
            PropertiesByType.set(property.type, []);
        }
        PropertiesByType.get(property.type).push(property);
    }
}
