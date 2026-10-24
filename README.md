# Cardi

Cardi is a two-player card combat game. **Cards are health**: each player starts with four regular cards and loses when all are permanently discarded. There is no separate HP pool.

On your turn choose **any suit stack**, roll a d6 and add the values of its available cards. Spend that attack budget to flip one or more enemy cards, using their printed values as costs. Hitting a flipped card again discards it. Flipped cards recover at the end of their owner's next turn.

**Emergency draw:** if every remaining regular card is flipped, draw one card into its matching suit stack and immediately end your turn. You cannot draw this way while any card is available. Jokers are rerolls and do not count as health.

See [GAME_RULES.md](GAME_RULES.md) for the complete working rules and unresolved mechanics. The browser game is a prototype; Jokers, face-card powers and reflexes are not yet playable.

## Run locally

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

The GitHub Pages deployment offers a bot and local two-player mode.