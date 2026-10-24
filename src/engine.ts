/** Cardi: deterministic, UI-independent card state primitives. */
export type Suit = "hearts" | "spades" | "clubs" | "diamonds";
export type Rank = 2|3|4|5|6|7|8|9|10|"jack"|"queen"|"king"|"ace";
export type Card = Readonly<{ id: string; suit: Suit; rank: Rank }>;
export type CardState = { card: Card; flipped: boolean; recoveryTurn: number | null };
export type Player = { id: string; turn: number; cards: CardState[]; discard: Card[] };
export type Game = { players: [Player, Player]; activePlayer: 0|1; phase: "playing"|"finished" };
export type AttackResult = "flipped"|"discarded";
export function rankValue(rank: Rank): number {
  return typeof rank === "number" ? rank : ({jack:11,queen:12,king:13,ace:14} as const)[rank];
}
export function makeDeck(): Card[] {
  const suits: Suit[] = ["hearts","spades","clubs","diamonds"];
  const ranks: Rank[] = [2,3,4,5,6,7,8,9,10,"jack","queen","king","ace"];
  return suits.flatMap(suit=>ranks.map(rank=>({id:`${suit}-${rank}`,suit,rank})));
}
export function createPlayer(id:string,cards:Card[]=[]):Player {
  if (new Set(cards.map(c=>c.id)).size !== cards.length) throw new Error("Duplicate card IDs");
  return {id,turn:0,cards:cards.map(card=>({card,flipped:false,recoveryTurn:null})),discard:[]};
}
export function createGame(a:Player,b:Player):Game {
  if(a.id===b.id) throw new Error("Player IDs must differ");
  return {players:[a,b],activePlayer:0,phase:"playing"};
}
export function availableReflexes(player:Player):number {
  return player.cards.filter(s=>s.card.suit==="diamonds"&&!s.flipped).length;
}
/** Attacked cards stay flipped through the defender's next turn and the attacker's next opportunity. */
export function attackCard(defender:Player,cardId:string):AttackResult {
  const index=defender.cards.findIndex(s=>s.card.id===cardId);
  if(index<0) throw new Error("Target card not found");
  const state=defender.cards[index];
  if(state.flipped) {
    defender.discard.push(state.card);
    defender.cards.splice(index,1);
    return "discarded";
  }
  const topmost=defender.cards.findLastIndex(s=>s.card.suit===state.card.suit);
  if(index!==topmost) throw new Error("Only the topmost card of a suit can be attacked");
  state.flipped=true;
  state.recoveryTurn=defender.turn+2;
  return "flipped";
}
/** Using reflex temporarily flips one available diamond. */
export function useReflex(player:Player):Card {
  const state=player.cards.find(s=>s.card.suit==="diamonds"&&!s.flipped);
  if(!state) throw new Error("No available diamond reflex");
  state.flipped=true;
  state.recoveryTurn=player.turn+1;
  return state.card;
}
/** End a player's turn; cards flipped before this turn recover after one full turn. */
export function endTurn(game:Game):void {
  if(game.phase!=="playing") throw new Error("Game is finished");
  const current=game.players[game.activePlayer];
  current.turn++;
  for(const state of current.cards){
    if(state.flipped&&state.recoveryTurn!==null&&state.recoveryTurn<=current.turn){
      state.flipped=false;state.recoveryTurn=null;
    }
  }
  game.activePlayer=game.activePlayer===0?1:0;
}
export function activeModifierCards(player:Player,suit:Suit):Card[] {
  return player.cards.filter(s=>s.card.suit===suit&&!s.flipped).map(s=>s.card);
}
