import {describe,it,expect} from "vitest";
import {attackCard,availableReflexes,createGame,createPlayer,endTurn,makeDeck,useReflex} from "../src/engine";
const deck=makeDeck();
const card=(id:string)=>{const c=deck.find(c=>c.id===id);if(!c)throw Error(id);return c;};
describe("Cardi engine",()=>{
 it("builds a unique 52-card deck",()=>{expect(deck).toHaveLength(52);expect(new Set(deck.map(c=>c.id)).size).toBe(52);});
 it("limits reflexes to unflipped diamonds",()=>{const p=createPlayer("a",[card("diamonds-2"),card("diamonds-3")]);expect(availableReflexes(p)).toBe(2);useReflex(p);expect(availableReflexes(p)).toBe(1);useReflex(p);expect(()=>useReflex(p)).toThrow();});
 it("only allows a topmost suit card to be flipped",()=>{const p=createPlayer("b",[card("hearts-2"),card("hearts-3")]);expect(()=>attackCard(p,"hearts-2")).toThrow();expect(attackCard(p,"hearts-3")).toBe("flipped");expect(p.cards[0].flipped).toBe(false);});
 it("discards a flipped card on another successful attack",()=>{const p=createPlayer("b",[card("spades-7")]);expect(attackCard(p,"spades-7")).toBe("flipped");expect(attackCard(p,"spades-7")).toBe("discarded");expect(p.cards).toHaveLength(0);expect(p.discard).toHaveLength(1);});
 it("recovers flipped cards at end of owner's next turn",()=>{const a=createPlayer("a",[card("diamonds-6")]);const b=createPlayer("b");const game=createGame(a,b);useReflex(a);endTurn(game);expect(a.cards[0].flipped).toBe(false);});
});
