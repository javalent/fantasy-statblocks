```statblock
name: Chimera
image: [[chimera-tile.png]]
flavor_text: "In illustrated bestiaries copied down through the ages, the three bodies of the chimera are merged neatly: lion, dragon, and goat. In reality, scales and hair, and hooves and claws all mingle in a chaotic form. No two chimeras are exactly alike, and most include modest portions of other beasts, as well as the standard three. Their distorted forms bring them pain. They take it out on everything else."
size: large
level: 9th
role: wrecker
type: beast
initiative: 15
vulnerability: none
ac: 24
pd: 20
md: 16
hp: 320
actions:
    - name: Fangs, claws, and horns +14 vs. AC (3 attacks)
      desc: 25 damage
      traits:
          - name: natural 14–15
            desc: The target is dazed until the end of the chimera’s next turn from a headbutt.
          - name: natural 16–17
            desc: The target takes 20 ongoing damage from raking claws.
          - name: natural 18–20
            desc: The chimera makes a _Fiery Breath_ attack as a free action.
          - name: limited use
            desc: 3/battle
triggered_actions:
    - name: Fiery breath +14 vs. PD (up to 3 nearby enemies in a group)
      desc: 3d10 fire damage
traits:
    - name: Bestial thresher
      desc: "Whenever a creature misses the chimera with a melee attack, the chimera’s multiple sharp bits deal 3d10 damage to that attacker."
nastier_traits:
    - name: Now it’s angry!
      desc: When an attacker scores a critical hit against the chimera and it survives, its attack rolls on its next turn deal the effects of the lower rolls as well as their own results; for example, a roll of 18–20 would daze the target and deal 20 ongoing damage as well as triggering fiery breath.
description: "<h2>Icons</h2><p>It is said that wizards trained by the original Wizard King treated the creation of their own unique chimera as a rite of passage. As a defender of the Empire, the Archmage obviously scorns such misguided uses of power. Of course, individual wizards acting on their own initiative might set out to prove that chimeras created according to the formulas of the Archmage are superior. Ahem.</p><p>In the present age, the iron-fisted forces of the Crusader and the Orc Lord feel no shame in indulging the chimera’s requirements for slaughter and torture.<p>"
```