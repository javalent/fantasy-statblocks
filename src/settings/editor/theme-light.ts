import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Colors from https://www.nordtheme.com/docs/colors-and-palettes
// Polar Night
const base00 = "#2e3440", // black
  base01 = "#3b4252", // dark grey
  base02 = "#434c5e",
  base03 = "#4c566a"; // grey

// Snow Storm
const base04 = "#d8dee9", // grey
  base05 = "#e5e9f0", // off white
  base06 = "#eceff4"; // white

// Frost
const base07 = "#8fbcbb", // moss green
  base08 = "#88c0d0", // ice blue
  base09 = "#81a1c1", // water blue
  base0A = "#5e81ac"; // deep blue

// Aurora
const base0b = "#bf616a", // red
  base0C = "#d08770", // orange
  base0D = "#ebcb8b", // yellow
  base0E = "#a3be8c", // green
  base0F = "#b48ead"; // purple

const invalid = "#d30102",
  darkBackground = base06,
  highlightBackground = darkBackground,
  background = "#ffffff",
  tooltipBackground = base01,
  selection = darkBackground,
  cursor = base01;

/// The editor theme styles for Basic Light.
export const basicLightTheme = EditorView.theme(
  {
    "&": {
      color: base00,
      backgroundColor: background,
    },

    ".cm-content": {
      caretColor: cursor,
    },

    ".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: selection,
    },

    ".cm-panels": { backgroundColor: darkBackground, color: base03 },
    ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
    ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },

    ".cm-searchMatch": {
      backgroundColor: "#72a1ff59",
      outline: `1px solid ${base03}`,
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: base05,
    },

    ".cm-activeLine": { backgroundColor: highlightBackground },
    ".cm-selectionMatch": { backgroundColor: base05 },

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      outline: `1px solid ${base03}`,
    },

    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: base06,
    },

    ".cm-gutters": {
      backgroundColor: base06,
      color: base00,
      border: "none",
    },

    ".cm-activeLineGutter": {
      backgroundColor: highlightBackground,
    },

    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: "#ddd",
    },

    ".cm-tooltip": {
      border: "none",
      backgroundColor: tooltipBackground,
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: tooltipBackground,
      borderBottomColor: tooltipBackground,
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: highlightBackground,
        color: base03,
      },
    },
  },
  { dark: false }
);

/// The highlighting style for code in the Basic Light theme.
export const basicLightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: base0A },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: base0C,
  },
  { tag: [t.variableName], color: base0C },
  { tag: [t.function(t.variableName)], color: base0A },
  { tag: [t.labelName], color: base09 },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: base0A,
  },
  { tag: [t.definition(t.name), t.separator], color: base0E },
  { tag: [t.brace], color: base07 },
  {
    tag: [t.annotation],
    color: invalid,
  },
  {
    tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: base08,
  },
  {
    tag: [t.typeName, t.className],
    color: base0D,
  },
  {
    tag: [t.operator, t.operatorKeyword],
    color: base0E,
  },
  {
    tag: [t.tagName],
    color: base0F,
  },
  {
    tag: [t.squareBracket],
    color: base0b,
  },
  {
    tag: [t.angleBracket],
    color: base0C,
  },
  {
    tag: [t.attributeName],
    color: base0D,
  },
  {
    tag: [t.regexp],
    color: base0A,
  },
  {
    tag: [t.quote],
    color: base01,
  },
  { tag: [t.string], color: base0C },
  {
    tag: t.link,
    color: base07,
    textDecoration: "underline",
    textUnderlinePosition: "under",
  },
  {
    tag: [t.url, t.escape, t.special(t.string)],
    color: base0C,
  },
  { tag: [t.meta], color: base08 },
  { tag: [t.comment], color: base02, fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold", color: base0A },
  { tag: t.emphasis, fontStyle: "italic", color: base0A },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.heading, fontWeight: "bold", color: base0A },
  { tag: t.special(t.heading1), fontWeight: "bold", color: base0A },
  { tag: t.heading1, fontWeight: "bold", color: base0A },
  {
    tag: [t.heading2, t.heading3, t.heading4],
    fontWeight: "bold",
    color: base0A,
  },
  {
    tag: [t.heading5, t.heading6],
    color: base0A,
  },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: base0C },
  {
    tag: [t.processingInstruction, t.inserted],
    color: base07,
  },
  {
    tag: [t.contentSeparator],
    color: base0D,
  },
  { tag: t.invalid, color: base02, borderBottom: `1px dotted ${invalid}` },
]);

/// Extension to enable the Basic Light theme (both the editor theme and
/// the highlight style).
export const basicLight: Extension = [basicLightTheme, syntaxHighlighting(basicLightHighlightStyle)];
