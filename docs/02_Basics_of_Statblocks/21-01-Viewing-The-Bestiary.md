---
has_children: false
has_toc: true
layout: default
nav_order: 1
parent: "The Basics of Fantasy Statblocks"
permalink: /:path/:basename
title: Viewing the Bestiary
---

# Viewing the Bestiary

To use Fantasy Statblocks to render the bestiary data, the statblock is accessed in one of two ways. 

1. It is recalled from the Fantasy Bestiary, Fantasy Statblocks, or Obsidian by name, or another search function.
2. It is created manually within the Fantasy Statblock via code block. 

On this page we will cover the first option. The second will be covered in [Creating a New Entity](docs/02_Basics_of_Statblocks/01-02-Creating-A-New-Entity.md).

## Recall by Name

Currently within Fantasy Statblocks, only recall by name is supported as the way to pull entities from within the internal Fantasy Statblocks database. When Fantasy Bestiary is completed, this is expected to expand.

As mentioned in the introduction to this section, a statblock may be defined in a note using the base syntax below.

````yaml
```statblock
monster: <SRD/Homebrew Monster Name>
```
````
