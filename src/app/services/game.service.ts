import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DeckService } from './deck.service';
import { CardData } from '../components/card/card.component';

export interface Player {
  id: number;
  name: string;
  hand: CardData[];
  seat: 'A1' | 'B1' | 'A2' | 'B2';
  bid: number | null;
  passed: boolean;
  goDown: CardData[] | null;
}

export interface PlayedCard {
  playerId: number;
  playerName: string;
  card: CardData;
}

export interface Trick {
  cards: PlayedCard[];
  winner: Player;
}

export type TrumpSuit = 'Red' | 'Yellow' | 'Black' | 'Green' | null;

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();

  private widowSubject = new BehaviorSubject<CardData[]>([]);
  widow$ = this.widowSubject.asObservable();

  private currentBidderSubject = new BehaviorSubject<Player | null>(null);
  currentBidder$ = this.currentBidderSubject.asObservable();

  private currentBidSubject = new BehaviorSubject<number>(65);
  currentBid$ = this.currentBidSubject.asObservable();

  private bidWinnerSubject = new BehaviorSubject<Player | null>(null);
  bidWinner$ = this.bidWinnerSubject.asObservable();

  private biddingCompleteSubject = new BehaviorSubject<boolean>(false);
  biddingComplete$ = this.biddingCompleteSubject.asObservable();

  private trumpSuitSubject = new BehaviorSubject<TrumpSuit>(null);
  trumpSuit$ = this.trumpSuitSubject.asObservable();

  private gamePhaseSubject = new BehaviorSubject<'bidding' | 'selectingGoDown' | 'selectingTrump' | 'playingTricks'>('bidding');
  gamePhase$ = this.gamePhaseSubject.asObservable();

  private currentTrickSubject = new BehaviorSubject<PlayedCard[]>([]);
  currentTrick$ = this.currentTrickSubject.asObservable();

  private currentPlayerSubject = new BehaviorSubject<Player | null>(null);
  currentPlayer$ = this.currentPlayerSubject.asObservable();

  private trickNumberSubject = new BehaviorSubject<number>(1);
  trickNumber$ = this.trickNumberSubject.asObservable();

  private scoreSubject = new BehaviorSubject<{ A: number, B: number }>({ A: 0, B: 0 });
  score$ = this.scoreSubject.asObservable();

  private dealerSeatSubject = new BehaviorSubject<'A1' | 'B1' | 'A2' | 'B2'>('A1');
  dealerSeat$ = this.dealerSeatSubject.asObservable();

  private trickHistorySubject = new BehaviorSubject<Trick[]>([]);
  trickHistory$ = this.trickHistorySubject.asObservable();

  private trickCountsSubject = new BehaviorSubject<{ A: number, B: number }>({ A: 0, B: 0 });
  trickCounts$ = this.trickCountsSubject.asObservable();

  constructor(private deckService: DeckService) {}

  startNewGame() {
    this.deckService.shuffleDeck();
    const hands = this.deckService.dealCards(4, 9);
    const players: Player[] = [
      { id: 1, name: 'Player 1', hand: hands[0], seat: 'A1', bid: null, passed: false, goDown: null },
      { id: 2, name: 'Player 2', hand: hands[1], seat: 'B1', bid: null, passed: false, goDown: null },
      { id: 3, name: 'Player 3', hand: hands[2], seat: 'A2', bid: null, passed: false, goDown: null },
      { id: 4, name: 'Player 4', hand: hands[3], seat: 'B2', bid: null, passed: false, goDown: null }
    ];
    this.playersSubject.next(players);

    const widow = this.deckService.dealWidow();
    this.widowSubject.next(widow);

    this.currentBidSubject.next(65);
    this.currentBidderSubject.next(players[0]);
    this.bidWinnerSubject.next(null);
    this.gamePhaseSubject.next('bidding');
    this.trumpSuitSubject.next(null);
  }

  placeBid(playerId: number, bidAmount: number | null) {
    const players = this.playersSubject.value;
    const playerIndex = players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) return;

    if (bidAmount === null) {
      players[playerIndex].passed = true;
    } else if (bidAmount > 120) {
      console.error('Bid cannot exceed 120');
      return;
    } else {
      players[playerIndex].bid = bidAmount;
      this.currentBidSubject.next(bidAmount);
      this.bidWinnerSubject.next(players[playerIndex]);
    }

    if (this.checkBiddingComplete(players)) {
      this.endBidding();
    } else {
      this.moveToNextBidder(players, playerIndex);
    }

    this.playersSubject.next(players);
  }

  private checkBiddingComplete(players: Player[]): boolean {
    const passedPlayers = players.filter(p => p.passed).length;
    return passedPlayers === 3;
  }

  private moveToNextBidder(players: Player[], currentIndex: number) {
    let nextIndex = (currentIndex + 1) % players.length;
    while (players[nextIndex].passed) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    this.currentBidderSubject.next(players[nextIndex]);
  }

  endBidding() {
    const bidWinner = this.bidWinnerSubject.value;
    if (bidWinner) {
      const widow = this.widowSubject.value;
      bidWinner.hand = [...bidWinner.hand, ...widow];
      this.widowSubject.next([]);
      this.gamePhaseSubject.next('selectingGoDown');
      this.playersSubject.next(this.playersSubject.value);
    }
  }

  setGoDown(playerId: number, cards: CardData[]) {
    if (this.gamePhaseSubject.value !== 'selectingGoDown') {
      console.error('Cannot set GoDown: Not in GoDown selection phase');
      return;
    }

    const players = this.playersSubject.value;
    const player = players.find(p => p.id === playerId);

    if (!player) {
      console.error('Player not found');
      return;
    }

    if (player.goDown !== null) {
      console.error('GoDown already set for this player');
      return;
    }

    if (cards.length !== 4) {
      console.error('GoDown must consist of exactly 4 cards');
      return;
    }

    // Remove the selected cards from the player's hand
    player.hand = player.hand.filter(card => !cards.includes(card));
    player.goDown = cards;

    this.playersSubject.next(players);
    this.gamePhaseSubject.next('selectingTrump');
  }

  selectTrump(suit: TrumpSuit) {
    this.trumpSuitSubject.next(suit);
    this.gamePhaseSubject.next('playingTricks');
    this.startTrickPhase();
  }

  startTrickPhase() {
    this.gamePhaseSubject.next('playingTricks');
    this.trickNumberSubject.next(1);
    this.currentTrickSubject.next([]);
    // Set the current player to the one left of the dealer
    const players = this.playersSubject.value;
    const dealerSeat = this.dealerSeatSubject.value;
    const dealerIndex = players.findIndex(p => p.seat === dealerSeat);
    this.currentPlayerSubject.next(players[(dealerIndex + 1) % 4]);
  }

  playCard(playerId: number, card: CardData) {
    const currentPlayer = this.currentPlayerSubject.value;
    if (currentPlayer?.id !== playerId) {
      console.error('Not this player\'s turn');
      return;
    }

    const currentTrick = this.currentTrickSubject.value;
    const players = this.playersSubject.value;
    const player = players.find(p => p.id === playerId);

    if (!player) {
      console.error('Player not found');
      return;
    }

    // Check if the played card follows suit
    if (currentTrick.length > 0) {
      const leadSuit = currentTrick[0].card.suit;
      if (card.suit !== leadSuit && player.hand.some(c => c.suit === leadSuit)) {
        console.error('Must follow suit');
        return;
      }
    }

    // Remove the card from the player's hand
    player.hand = player.hand.filter(c => c !== card);

    // Add the card to the current trick
    currentTrick.push({ playerId, playerName: player.name, card });
    this.currentTrickSubject.next(currentTrick);

    if (currentTrick.length === 4) {
      this.resolveTrick();
    } else {
      // Move to the next player
      const nextPlayerIndex = (players.indexOf(currentPlayer) + 1) % 4;
      this.currentPlayerSubject.next(players[nextPlayerIndex]);
    }

    this.playersSubject.next(players);
  }

  private resolveTrick() {
    const currentTrick = this.currentTrickSubject.value;
    const trumpSuit = this.trumpSuitSubject.value;
    const leadSuit = currentTrick[0].card.suit;

    // Determine the winning card
    const winningCard = currentTrick.reduce((winner, played) => {
      if (played.card.suit === trumpSuit && winner.card.suit !== trumpSuit) {
        return played;
      }
      if (played.card.suit === winner.card.suit && played.card.number > winner.card.number) {
        return played;
      }
      return winner;
    });

    // Update trick counts
    const winningTeam = this.getPlayerTeam(winningCard.playerId);
    this.updateTrickCount(winningTeam);

    // Set the next current player
    const players = this.playersSubject.value;
    const winningPlayer = players.find(p => p.id === winningCard.playerId)!;

    // Add the trick to the history
    const trickHistory = this.trickHistorySubject.value;
    trickHistory.push({ cards: currentTrick, winner: winningPlayer });
    this.trickHistorySubject.next(trickHistory);

    this.currentPlayerSubject.next(winningPlayer);

    // Clear the current trick
    this.currentTrickSubject.next([]);

    // Increment the trick number
    const trickNumber = this.trickNumberSubject.value;
    if (trickNumber < 9) {
      this.trickNumberSubject.next(trickNumber + 1);
    } else {
      this.endHand();
    }
  }

  private updateTrickCount(team: 'A' | 'B') {
    const counts = this.trickCountsSubject.value;
    counts[team]++;
    this.trickCountsSubject.next(counts);
  }

  private getPlayerTeam(playerId: number): 'A' | 'B' {
    const players = this.playersSubject.value;
    const player = players.find(p => p.id === playerId);
    return player?.seat === 'A1' || player?.seat === 'A2' ? 'A' : 'B';
  }

  private endHand() {
    const score = this.scoreSubject.value;
    const trickCounts = this.trickCountsSubject.value;
    const currentTrick = this.currentTrickSubject.value;
    const bidWinner = this.bidWinnerSubject.value;

    // Calculate points from tricks
    const trickPoints = this.calculateHandPoints();

    // Add points from the GoDown
    const goDownPoints = this.calculateGoDownPoints();
    trickPoints[this.getPlayerTeam(currentTrick[3].playerId)] += goDownPoints;

    // Add 20 points for the team that won the most tricks
    if (trickCounts.A > trickCounts.B) {
      trickPoints.A += 20;
    } else if (trickCounts.B > trickCounts.A) {
      trickPoints.B += 20;
    }

    // Check if the bid was made
    const bidWinnerTeam = this.getPlayerTeam(bidWinner!.id);
    const bidAmount = bidWinner!.bid!;
    if (trickPoints[bidWinnerTeam] >= bidAmount) {
      score[bidWinnerTeam] += trickPoints[bidWinnerTeam];
      score[bidWinnerTeam === 'A' ? 'B' : 'A'] += trickPoints[bidWinnerTeam === 'A' ? 'B' : 'A'];
    } else {
      score[bidWinnerTeam] -= bidAmount;
    }

    this.scoreSubject.next(score);
    this.resetForNextHand();
  }

  private calculateHandPoints(): { A: number, B: number } {
    const points = { A: 0, B: 0 };
    this.trickHistorySubject.value.forEach((trick: Trick) => {
      trick.cards.forEach((playedCard: PlayedCard) => {
        const cardPoints = this.getCardPoints(playedCard.card);
        const team = this.getPlayerTeam(playedCard.playerId);
        points[team] += cardPoints;
      });
    });
    return points;
  }

  private calculateGoDownPoints(): number {
    const goDown = this.bidWinnerSubject.value?.goDown || [];
    return goDown.reduce((total, card) => total + this.getCardPoints(card), 0);
  }

  private getCardPoints(card: CardData): number {
    if (card.number === 5) return 5;
    if (card.number === 10 || card.number === 13) return 10;
    return 0;
  }

  private resetForNextHand() {
    // Reset necessary state for the next hand
    this.trickCountsSubject.next({ A: 0, B: 0 });
    this.trickHistorySubject.next([]);
    this.gamePhaseSubject.next('bidding');
    // ... other necessary resets ...
  }
}