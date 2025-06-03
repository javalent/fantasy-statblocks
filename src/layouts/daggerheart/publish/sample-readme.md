---
aliases: [Daggerheart Adversary Layout]
description: "This page provides a basic code block for the Daggerheart Adversary Layout included within Fantasy Statblocks."
image: [[Example-Adversary.png]]
order: 5
permalink: statblock/layouts/integrated/daggerheart
publish: true
tags: [Statblocks/Layout/Daggerheart-Adversary]
---

[[Fantasy Statblocks|Fantasy Statblocks]] > [[Integrated Layouts|Integrated Statblock Layouts]] > Daggerheart

---

## Description

This collection of layouts is for use with the Daggerheart System Reference Document (SRD) as well as homebrew content made by the community. There are basic layouts for each of the following types of Daggerheart information:

- Adversary
- Environment
- Card

## Getting SRD Content

To get SRD available content, such as adversaries and environments, follow the directions below by heading to the daggerheart-srd project repository on github.com and download the json files.

- Go to: [https://github.com/seansbox/daggerheart-srd/tree/main/.build/json](https://github.com/seansbox/daggerheart-srd/tree/main/.build/json)
- Download the files you care about (for example adversaries.json contains all SRD adversaries).
- Open your vault and navigate to the fantasy-statblock plugin options.
- Select the Import Generic Data > Choose Files button.
- Select the file you wish to import.
- Obsidian will ask you to Set Sources, type in "daggerheart-type" (Example: daggerheart-adversary or daggerheart-environment)
- Confirm and your content should be installed.

## Credit and Attributions

This data is available courtesy of seansbox and Darrington Press, I am not the author, I just wrote the layouts. To learn more about seansbox' work go here: [https://github.com/seansbox/daggerheart-srd/](https://github.com/seansbox/daggerheart-srd/). To learn more about the SRD and Community Gaming License provided by Darrington Press/Critical Role See the Content License Below.

If you really wish to follow me you can [find me on github](https://github.com/gotsanity).

## Content License

This layout includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com/. There are minor modifications to format and structure. No previous modifications by others.

Daggerheart and all related marks are trademarks of Critical Role, LLC and used with permission. This project is not affiliated with, endorsed, or sponsored by Critical Role or Darrington Press.

For full license terms, see: https://www.daggerheart.com/


## Sample Image

>[!screenshot]- Screenshot of a Monster
> ![https://raw.githubusercontent.com/gotsanity/fantasy-statblocks/refs/heads/main/src/layouts/daggerheart/publish/images/Example-Adversary.png](https://raw.githubusercontent.com/gotsanity/fantasy-statblocks/refs/heads/main/src/layouts/daggerheart/publish/images/Example-Adversary.png) 

## Daggerheart Code Block

````yaml
```statblock
columns: 2
forceColumns: true
layout: Daggerheart Adversary
source: "daggerheart-adversary"
name: "Acid Burrower"
tier: 1
type: "Solo"
description: "A horse-sized insect with digging claws and acidic blood."
motives_and_tactics: "Burrow, drag away, feed, reposition"
difficulty: 14
thresholds: "8/15"
hp: 8
stress: 3
atk: "+3"
attack: "Claws"
range: "Very Close"
damage: "1d12+2 phy"
experience: "Tremor Sense +2"
feats:
- name: "Relentless (3) - Passive"
  text: "The Burrower can be spotlighted up to three times per GM turn. Spend Fear as usual to spotlight them."
- name: "Earth Eruption - Action"
  text: "Mark a Stress to have the Burrower burst out of the ground. All creatures within Very Close range must succeed on an Agility Reaction Roll or be knocked over, making them Vulnerable until they next act."
- name: "Spit Acid - Action"
  text: "Make an attack against all targets in front of the Burrower within Close range. Targets the Burrower succeeds against take 2d6 physical damage and must mark an Armor Slot without receiving its benefits (they can still use armor to reduce the damage). If they can’t mark an Armor Slot, they must mark an additional HP and you gain a Fear."
- name: "Acid Bath - Reaction"
  text: "When the Burrower takes Severe damage, all creatures within Close range are bathed in their acidic blood, taking 1d10 physical damage. This splash covers the ground within Very Close range with blood, and all creatures other than the Burrower who move through it take 1d6 physical damage."
```
````


### Daggerheart Empty Codeblock

````yaml
```statblock
columns: integer between 1 and 2
forceColumns: Boolean
layout: Daggerheart Adversary
source: 
name: 
tier:
type:
description:
motives_and_tactics:
difficulty:
thresholds:
hp:
stress:
atk:
attack:
range:
damage:
experience:
feats:
- name:
  text:
- name:
  text:
```
````
