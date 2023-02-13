---
has_children: false
has_toc: true
layout: default
nav_order: 1
parent: Common Troubleshooting
permalink: /:path/:basename
title: Statblock Does Not Render
---

# Statblock Does Not Render

## YAML Validation Errors

The most common reason why a Statblock will not render, is due to YAML syntax errors. 

The following is a list of common syntax errors in alphabetical order.

### Asterisks

````yaml
```statblock
Defense: "Plate Armor"
Hit Points: "**200**" 
Hit Dice: "200 (20d20)"
```
````

Asterisks are used in Obsidian by default to **bold** and italic *words*. However, asterisks are also a symbol for mathematical properties in most programming languages. We've all used (3 x 5) and (3 \* 5) at some point. 

In YAML, an asterisk takes on an even weirder form by acting as an alias for an already defined set of data. 

Since this behavior is undesired, we need to use underscores when making bold and italic data to remain compliant.

The corrected YAML will be:

````yaml
```statblock
Defense: "Plate Armor"
Hit Points: "__200__" 
Hit Dice: "200 (20d20)"
```
````


### Escaping Characters


### New Lines


### Quotation Marks