![](https://img.shields.io/badge/Foundry-v0.8.6-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/kandashi/randomizer-npc/repo>/latest/module.zip)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Frandomizer-npc&colorB=4aa94a)

# Randomizer NPC

This allows for your unlinked tokens to be that little extra bit different. Randomize available weapons, spells, hp and ability scores; all by just dropping a token onto the canvas.

## HP

Auto rolls for a tokens HP (does not send chat message)

## Ability Scores

Rolls a user defined formula to apply to each ability score (default of +1d4-2)

## Randomize Weapons

Reduces the weapons on the Actor down to a specified amount by either melee/ranged weapons
Configure this level within the Special Traits menu of the *Original Actor* 

## Randomize Spells

Reduces the spells on the actor down to a specified amount by spell level.
Configure this level within the Special Traits menu of the *Original Actor*. The value should be numbers split by `;` increasing in spell level from cantrip to 9th level
`4;3;2;2;1` would result in 4 cantrips, 3 first level, 2 second and third level and 1 fourth level on the unlinked token.

## Randomize Race

Adds a item from a compendium of `races` to determine token race. The bundled compendium comes with Active Effects for the race traits, I suggest reducing the randomization slightly to offset these bonuses (1d3-2 perhaps)
Configure this within the Special Traits menu of the *Original Actor*