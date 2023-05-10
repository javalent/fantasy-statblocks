---
aliases: [Basic Pathfinder 2e Layout]
description: "This page provides a basic code block for the Basic Pathfinder 2e Layout included within Fantasy Statblocks."
image: 
order: 4
permalink: statblock/layouts/integrated/pf2e
publish: true
tags: [Statblocks/Layout/PF2e]
---

[[Fantasy Statblocks|Fantasy Statblocks]] > [[Integrated Layouts|Integrated Statblock Layouts]] > *You Are Here*

---

This page provides a basic code block for the Pathfinder 2e layout included within Fantasy Statblocks.

The layout includes all the essential [[Key|Key]] information needed to create a creature, now it is up to you and your imagination to do the rest. Make its abilities, attacks, and skills. Give it spells, or an image. Turn your favorite character into a statblock, or even the building across the street.

## Sample Image

>[!screenshot]- Screenshot of a Seething Umbral Dragon
> ![Seething Umbral Dragon](https://github.com/valentine195/fantasy-statblocks/blob/gh-pages/images/statblock/pf2e.png?raw=true)

## PF2e Code Block

````yaml
```statblock
columns: Number
forcecolumns: Boolean
layout: Layout Number
source: "Source in String"
name: "Name in String"
level: "Creature 16"
rare_01: "Rarity in String"
rare_02: "Rarity in String"
rare_03: "Rarity in String"
rare_04: "Rarity in String"
alignment: "Alignment in String"
size: "Size in String"
trait_01: "Trait in String"
trait_02: "Trait in String"
trait_03: "Trait in String"
trait_04: "Trait in String"
trait_05: "Trait in String"
trait_06: "Trait in String"
trait_07: "Trait in String"
modifier: Number
perception:
  - name: "Perception or Name in String"
    desc: "Description in String"
languages: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
skills:
  - name: "Name in String"
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
abilityMods: [8, 5, 6, 4, 5, 5]

abilities_mid:
  - name: "Name in String"
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
  - name: "Name in String"
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
abilities_bot:
  - name: "Name in String"
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
  - name: "Name in String"
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
  - name: "Name in String"
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
  - name: "Name in String"
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."

speed: Speed in no string

ac: Number
armorclass:
  - name: Name
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
hp: Number
health:
  - name: Name
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."


attacks:
  - name: Name
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
  - name: Name
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
  - name: Name
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
  - name: Name
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."

spellcasting:
  - name: "Name in String"
    desc: "Description in String. Links in Wikilink. Bolds surrounded by Underscores."
sourcebook: "Name in String"
```
````


---
