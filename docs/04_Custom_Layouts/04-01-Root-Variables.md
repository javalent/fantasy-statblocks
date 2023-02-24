---
aliases: [The Group Blocks]
has_children: true
has_toc: true
layout: default
nav_order: 1
parent: "Custom Layouts"
permalink: /:path/:basename
tags: [Groups]
title: Root Variables
---

# The Root Variables

Fantasy Statblocks is skinned by default to look like the Dungeons and Dragons 5th Edition Statblock. With that, it has a set of root variables it uses to fall back on to choose attributes for a statblock in case that attribute is otherwise undefined.

We will use these variables for our purposes.

## The Defaults

I will take a moment to suggest some alternatives as you move forward.

1) Instead of using Hex colors `#7a200d` use `rgba(122, 32, 13, 1)`. The last number is the alpha.
2) Instead of px (pixels), use em or rem. If your default font across Statblocks is 16px, then 1em is 16px.
3) As such, leave `--statblock-content-font-size: 14px;` in pixels.
4) If you are well versed in SCSS and Sass, you know when to link a variable to a variable. For a beginner, avoid this `--statblock-image-border-color: var(--statblock-primary-color)`.  Does it save time when you want all colors to be the same? About three seconds. Does it cause much confusion when trying to find an issue? Yes.

Now, we have these variables. Are you going to throw them in a .css file and call it a day? Nope! Its going to effect everything. We need a layout to pin this to. Keep this page open and handy, and move onto your

```css
:root {
    --statblock-primary-color: #7a200d;
    --statblock-rule-color: #922610;
    --statblock-background-color: #fdf1dc;
    --statblock-bar-color: #e69a28;
    --statblock-bar-border-size: 1px;
    --statblock-bar-border-color: #000;
    --statblock-image-width: 75px;
    --statblock-image-height: 75px;
    --statblock-image-border-size: 2px;
    --statblock-image-border-color: var(--statblock-primary-color);
    --statblock-border-size: 1px;
    --statblock-border-color: #ddd;
    --statblock-box-shadow-color: #ddd;
    --statblock-box-shadow-x-offset: 0;
    --statblock-box-shadow-y-offset: 0;
    --statblock-box-shadow-blur: 1.5em;
    --statblock-font-color: var(--statblock-primary-color);
    --statblock-font-weight: 700;
    --statblock-content-font: "Noto Sans", "Myriad Pro", Calibri, Helvetica, Arial, sans-serif;
    --statblock-content-font-size: 14px;
    --statblock-heading-font: "Libre Baskerville", "Lora", "Calisto MT", "Bookman Old Style", Bookman, "Goudy Old Style", Garamond, "Hoefler Text", "Bitstream Charter", Georgia, serif;
    --statblock-heading-font-color: var(--statblock-font-color);
    --statblock-heading-font-size: 23px;
    --statblock-heading-font-variant: small-caps;
    --statblock-heading-font-weight: var(--statblock-font-weight);
    --statblock-heading-line-height: inherit;
    --statblock-property-line-height: 1.4;
    --statblock-property-font-color: var(--statblock-font-color);
    --statblock-property-name-font-color: var(--statblock-font-color);
    --statblock-property-name-font-weight: bold;
    --statblock-section-heading-border-size: 1px;
    --statblock-section-heading-border-color: var(--statblock-primary-color);
    --statblock-section-heading-font-color: var(--statblock-font-color);
    --statblock-section-heading-font-size: 21px;
    --statblock-section-heading-font-variant: small-caps;
    --statblock-section-heading-font-weight: normal;
    --statblock-saves-line-height: 1.4;
    --statblock-spells-font-style: italic;
    --statblock-subheading-font-size: 12px;
    --statblock-subheading-font-style: italic;
    --statblock-subheading-font-weight: normal;
    --statblock-table-header-font-weight: bold;
    --statblock-traits-font-weight: bold;
    --statblock-traits-font-style: italic;
}
```

