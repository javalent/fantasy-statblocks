---
aliases: [Creating a new Entity]
has_children: false
has_toc: true
layout: default
nav_order: 2
parent: "The Basics of Fantasy Statblocks"
permalink: /:path/:basename
title: Creating a new Entity
---

# Creating a New Entity

To create a new entity within Fantasy Statblock, we can import existing .json or YAML data. The most common way to create a new bestiary entry, however, is to create a new codeblock and fill out the data.

>{: .note }
>For the examples on this page, we'll assume that we're working with the default Dungeons and Dragons 5th Edition Layout.

## Dice Rolls

You can integrate the dice roller plugin in your Statblocks, which will allow you to roll dice inside stat blocks. This integration requires that you install and enable the Dice Roller plugin. Furthermore, the integration requires that one of the following conditions are true:
1. Enable "Integrate Dice Roller" in [General Settings](../01_Setting_Up_Fantasy_Statblocks/01-04-01-General-Settings.md).
2. The "dice: true" Key-Value pair is added to a Statblock codeblock in a note.

````yaml
```statblock
dice: true
name: "Ancient Red Dragon"
```
````

The plugin will then parse monster properties for common types of dice rolls. The plugin will create dice rollers for the following strings:

- **Rolling to hit**: +15 to hit
- **Damage / healing**: 19 (2d10 + 8)
- **A Save**: Strength +5

Want to change how Dice Rollers are added? Create a [Custom Layout](../04_Custom_Layouts/04-00-01-Index.md) in settings.

### Rendered Dice

Dice rollers added to stat blocks can roll 3D dice on the screen if one of the following conditions are true:
1. If the **Render Dice Rolls** setting is turned on in [General Settings](../01_Setting_Up_Fantasy_Statblocks/01-04-01-General-Settings.md).
2. The `render: true` parameter is added to a stat block.

````yaml
```statblock
dice: true
render: true
name: "Ancient Red Dragon"
```
````