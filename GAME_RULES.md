# Cardi — working rules and implementation status

This document records the agreed concepts and identifies decisions still needed. It is **not** a complete rules specification.

## Agreed concepts
- Browser game; TypeScript engine separate from the eventual UI.
- Suits: hearts = health; spades = defence/AC; clubs = attack; diamonds = initiative/reflex.
- Multiple cards of a suit can be held; only the topmost card in that suit is targeted by a normal card attack.
- A successful hit on an unflipped card flips it, suspending that card's active modifier without preventing use of lower cards.
- A successful hit on an already flipped card discards it permanently.
- Each available diamond provides one reflex use; using a reflex flips that diamond.
- Flipped cards recover at the end of their owner's next turn (one full turn).
- Face-card concepts: jack = disadvantage; queen = mirror; king = advantage; ace = explode; joker = reroll.
- Four-card initial draw was discussed.

## Open questions before full combat
- Exact combat resolution and damage, health, AC, initiative, and modifier formulas.
- Whether the topmost flipped card blocks targeting the lower cards (currently yes).
- Exact meaning, scope and timing of advantage, mirror, disadvantage, explode and reroll.
- Joker representation in the deck (the engine currently creates 52 standard suited cards).
- The precise moment a flip's recovery timer begins, particularly for attacks during the defender's turn.
- Deck, hand, draw, win conditions, and multiplayer synchronization.

The engine currently implements only card state, reflex availability, topmost targeting, discard on a second hit, and a provisional end-of-turn recovery rule. No complete combat loop or browser UI yet.
