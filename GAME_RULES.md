# Cardi — agreed rules (working draft)

Cardi is a two-player card attrition game. Deal four regular cards per player. **Each regular card is one health**; there is no HP pool. A player loses when all regular cards have been discarded. Flipped cards still count. Jokers are special rerolls, not health.

## Suits
Hearts: health; spades: defence; clubs: attack; diamonds: initiative/reflex. All four suits can be used to attack. For initiative each player rolls d6 plus their diamond-stack total; highest goes first (reroll ties).

## Combat
On your turn select any suit stack with unflipped cards. Add its unflipped card values to a d6 roll to form an attack budget. Spend that budget against one or more opponent cards; each target costs its printed value. Equal is sufficient: 12 can hit two sixes. Normally only the topmost card of each suit is targetable; an already flipped card can be hit again. First successful hit flips a card, temporarily removing its contribution; second successful hit while flipped discards it. Cards beneath flipped cards can still contribute to attacks.

Before the attack lands, an opponent with a Joker can force a reroll of its dice. A Joker can also reroll its owner's attack. Resolve the reroll before applying any hits. Exact Joker acquisition and multiple-Joker timing are not finalised.

## Recovery and draw
Flipped cards recover at the **end of their owner's next turn**, not before. If a player starts a turn with no unflipped regular cards, they may draw exactly one regular card, place it upright in its suit stack and immediately end their turn. This option is unavailable if any regular card is unflipped. If the deck is empty, end the turn without drawing.

## Face cards
Jack: two d6 added together. Queen: mirror the opponent's matching suit-stack value. King: two d6, take the higher. Ace: exploding die. Joker: reroll attack dice, outside the health count. Exact interactions remain open. Face-card target costs provisionally: Jack 11, Queen 12, King 13, Ace 14.

## Implementation status
The browser prototype covers basic suit-stack attacks, flips/discards, recovery, attrition and emergency draws. Joker reactions, face-card powers and diamond reflexes remain unimplemented.