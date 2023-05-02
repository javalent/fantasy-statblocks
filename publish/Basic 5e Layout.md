---
aliases: [Basic 5e Layout]
description: "This page provides the integrated layout block for Dungeons and Dragons 5th Edition Statblock, based on the visual representation of the Systems Resource Document (SRD) version."
image: 
order: 2
permalink: statblock/layouts/integrated/dnd5e
publish: true
tags: [Statblocks/Layout/5e]
---

[[Fantasy Statblocks|Fantasy Statblocks]] > [[Integrated Layouts|Integrated Statblock Layouts]] > *You Are Here*

---

On this page, you will find the layout block for the Dungeons and Dragons 5th Edition Statblock, visually based on the Systems Resource Document (SRD) version. 

> [!screenshot]- Screenshot of The Mummy Lord
> ![Mummy Lord](https://github.com/valentine195/fantasy-statblocks/blob/gh-pages/images/statblock/statblock-5e-mummy-lord.png?raw=true)

## DnD 5e Code Block

````yaml
```statblock
layout: Basic 5e Layout
image: [[Wikilink To Image]]
name: "Name in String"
size: "Size in String"
type: "Type in String"
subtype: "Subtype in String"
alignment: "Alignment in String"
ac: Number
hp: Number
hit_dice: "Hit Dice in String"
speed: string
stats: [1, 2, 3, 4, 5, 6]
fage_stats: [1, 2, 3, 4, 5, 6, 7, 8, 9]
saves:
  - dash: 0
  - potato: 1
  - stew: 3
skillsaves:
  - fake-skill: 0
  - turtle: 3
damage_vulnerabilities: string
damage_resistances: string
damage_immunities: string
condition_immunities: string
senses: string
languages: string
cr: number
spells:
  - "The fake monster is a fake level archmage."
  - "1/day (9th level): fake spell, fake spell, fake spell"
  -  "3/day: fake spell, fake spell, fake spell"
traits:
  - name: Fake Reaction
    desc: "Fake Desc"
  - name: Fake Reaction
    desc: "Fake Desc"
actions:
  - name: Fake Reaction
    desc: "Fake Desc"
  - name: Fake Reaction
    desc: "Fake Desc"
legendary_actions:
  - name: Fake Reaction
    desc: "Fake Desc"
  - name: Fake Reaction
    desc: "Fake Desc"
bonus_actions:
  - name: Fake Reaction
    desc: "Fake Desc"
  - name: Fake Reaction
    desc: "Fake Desc"
reactions:
  - name: Fake Reaction
    desc: "Fake Desc"
  - name: Fake Reaction
    desc: "Fake Desc"
```
````
