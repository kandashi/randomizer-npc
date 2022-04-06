Hooks.on('init', () => {

    /** name of the table on which to roll if a surge occurs */
    game.settings.register("randomizer-npc", "namelist", {
        name: "Randomizer names",
        hint: "Names of actors to randomize, seperate with ; ",
        scope: "world",
        config: true,
        default: "",
        type: String,
    });

    game.settings.register("randomizer-npc", "hpRoll", {
        name: "Randomizer HP",
        hint: "Auto roll HP for new tokens",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    })

    game.settings.register("randomizer-npc", "randomizeWeapons", {
        name: "Randomizer Weapons",
        hint: "Auto reduce tokens weapons to specified values",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    })

    game.settings.register("randomizer-npc", "randomizeRace", {
        name: "Randomizer Race",
        hint: "Auto apply Racial Feature from compendium",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    })

    game.settings.register("randomizer-npc", "raceCompendium", {
        name: "Race Pack name",
        hint: "Name of the compendium to draw race items from",
        scope: "world",
        config: true,
        default: "",
        type: String,
    })

    game.settings.register("randomizer-npc", "crRangeEnable", {
        name: 'Enable CR randomization',
        hint: 'Enables randomization for any create of CR equal or lower than the set value',
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
    });

    game.settings.register('randomizer-npc', 'crRange', {
        name: 'CR range for randomization',
        hint: 'What level of CR creature should be randomized, numeric. Use 0.25 for 1/4',
        scope: 'world',
        config: true,
        default: 0,
        type: Number,
    });

    game.settings.register("randomizer-npc", "randomizer", {
        name: "Ability Randomizer Value",
        hint: "Calculation of randomization. This is the calculation applied to every stat of a randomized creature",
        scope: "world",
        config: true,
        default: "+1d4-2",
        type: String,
    });

})

Hooks.on("init", () => {
    CONFIG.DND5E.characterFlags.randomizerMelee = {
        hint: "Number of melee weapons to keep on randomization",
        name: "NPC melee weapons",
        section: "Randomization",
        type: Number
    }
    CONFIG.DND5E.characterFlags.randomizerRanged = {
        hint: "Number of ranged weapons to keep on randomization",
        name: "NPC ranged weapons",
        section: "Randomization",
        type: Number
    }
    CONFIG.DND5E.characterFlags.randomizerSpellProg = {
        hint: "Number of spells of each level should be randomized, split by ';'",
        name: "NPC Spells per Level",
        section: "Randomization",
        type: String
    }
    CONFIG.DND5E.characterFlags.randomizerRace = {
        hint: "Randomly assign a race item",
        name: "Randomize Race",
        section: "Randomization",
        type: Boolean
    }

})

function Randomize(randomization, token) {
    let newData = {
        "data": {
            "abilities": {
                "cha": {
                    "value": token.actor.data.data.abilities.cha.value + new Roll(randomization).roll({async:false}).total
                },
                "con": {
                    "value": token.actor.data.data.abilities.con.value + new Roll(randomization).roll({async:false}).total
                },
                "dex": {
                    "value": token.actor.data.data.abilities.dex.value + new Roll(randomization).roll({async:false}).total
                },
                "int": {
                    "value": token.actor.data.data.abilities.int.value + new Roll(randomization).roll({async:false}).total
                },
                "str": {
                    "value": token.actor.data.data.abilities.str.value + new Roll(randomization).roll({async:false}).total
                },
                "wis": {
                    "value": token.actor.data.data.abilities.wis.value + new Roll(randomization).roll({async:false}).total
                }
            }
        }

    }
    token.update({ "actorData": newData })
}

Hooks.on("createToken", async (tokenDoc, options, id) => {
    if(tokenDoc.isLinked) return;
    let nameList = game.settings.get("randomizer-npc", "namelist").split(";");
    let randomization = game.settings.get('randomizer-npc', 'randomizer');

    if ((game.settings.get('randomizer-npc', 'crRangeEnable') == true)) {
        let crRange = game.settings.get('randomizer-npc', 'crRange')
        if (tokenDoc.actor.data.data.details.cr <= crRange) {
            Randomize(randomization, tokenDoc)
        }
    }
    else if (nameList.includes(tokenDoc.name)) {
        Randomize(randomization, tokenDoc)
    }

    if (game.settings.get("randomizer-npc", "hpRoll")) {
        const formula = tokenDoc.actor.data.data.attributes.hp.formula;
        if (!formula) return;
        const hp = new Roll(formula).roll({async:false}).total;
        AudioHelper.play({ src: CONFIG.sounds.dice });
        await tokenDoc.actor.update({ "data.attributes.hp.value": hp, "data.attributes.hp.max": hp });
    }

    if (game.settings.get("randomizer-npc", "randomizeWeapons")) {
        let { randomizerMelee, randomizerRanged, randomizerSpellProg } = tokenDoc.actor.data.flags.dnd5e
        let meleeWeapons = tokenDoc.actor.items.filter(i => i.data.data.actionType === "mwak")
        let rangedWeapons = tokenDoc.actor.items.filter(i => i.data.data.actionType === "rwak")
        let spells = tokenDoc.actor.items.filter(i => i.data.type === "spell")
        let deletedMelee = !!randomizerMelee ? await restrictWeapons(meleeWeapons, randomizerMelee) : []
        let deletedRanged = !!randomizerRanged ? await restrictWeapons(rangedWeapons, randomizerRanged) : []
        let deletedSpells = !!randomizerSpellProg ? await restrictSpells(spells, randomizerSpellProg) : []
        let update = deletedMelee.concat(deletedRanged, deletedSpells)
        if (update.length > 0) {
            await tokenDoc.actor.deleteEmbeddedDocuments("Item", update)
        }
    }

    if(game.settings.get("randomizer-npc", "randomizeRace")){
        let userPackName = game.settings.get("randomizer-npc", "raceCompendium")
        let pack = !!userPackName ? game.packs.find( i => i.metadata.name === userPackName) : game.packs.find( i => i.metadata.name === "Randomizer Races")
        let index = Math.floor(Math.random() * pack.index.size | 0)
        let race = await pack.getDocument(pack.index.contents[index]._id)
        await tokenDoc.actor.createEmbeddedDocuments("Item", [race.data])
    }

})

async function restrictSpells(spells, prog) {
    prog = prog.split(";")
    // "3,2,1,0,0,0,0,0"
    let spellArray = []
    for (let l = 0; l < 10; l++) {
        let leveled = spells.filter(i => i.data.data.level === l)
        let filtered = await restrictWeapons(leveled, prog[l])
        spellArray = spellArray.concat(filtered)
    }
    return spellArray
}

async function restrictWeapons(weapons, value) {
    if (typeof value === "string") value = parseInt(value)
    let ids = []
    for (var i = 1; i <= weapons.length - value; i) {
        let index = Math.floor(Math.random() * weapons.length | 0)
        ids.push(weapons[index].id)
        weapons.splice(index, 1)
    }
    return ids
}