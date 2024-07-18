import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DeckService } from './deck.service';
import { CardData } from '../components/card/card.component';
import { HandScoreRecord } from '../components/hand-score-history/hand-score-history.component';

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

  private gamePhaseSubject = new BehaviorSubject<'dealing' | 'bidding' | 'selectingGoDown' | 'selectingTrump' | 'playingTricks'>('dealing');
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

  private goDownSubject = new BehaviorSubject<CardData[]>([]);
  goDown$ = this.goDownSubject.asObservable();

  private handScoreSubject = new BehaviorSubject<{ A: number, B: number }>({ A: 0, B: 0 });
  handScore$ = this.handScoreSubject.asObservable();

  private handScoreHistorySubject = new BehaviorSubject<HandScoreRecord[]>([]);
  handScoreHistory$ = this.handScoreHistorySubject.asObservable();

  private currentHandPointsSubject = new BehaviorSubject<{ A: number, B: number }>({ A: 0, B: 0 });
  currentHandPoints$ = this.currentHandPointsSubject.asObservable();

  constructor(private deckService: DeckService) {}

  private updateTotalGameScore() {
    const handScoreHistory = this.handScoreHistorySubject.value;
    const totalScore = handScoreHistory.reduce(
      (total, record) => ({
        A: total.A + record.teamAScore,
        B: total.B + record.teamBScore
      }),
      { A: 0, B: 0 }
    );
    this.scoreSubject.next(totalScore);
  }

  startNewGame() {
    const initialPlayers: Player[] = [
      { id: 1, name: 'Player 1', hand: [], seat: 'A1', bid: null, passed: false, goDown: null },
      { id: 2, name: 'Player 2', hand: [], seat: 'B1', bid: null, passed: false, goDown: null },
      { id: 3, name: 'Player 3', hand: [], seat: 'A2', bid: null, passed: false, goDown: null },
      { id: 4, name: 'Player 4', hand: [], seat: 'B2', bid: null, passed: false, goDown: null }
    ];
    this.playersSubject.next(initialPlayers);
    this.dealerSeatSubject.next('A1');
    this.gamePhaseSubject.next('dealing');
    this.scoreSubject.next({ A: 0, B: 0 });
    this.handScoreHistorySubject.next([]);

    console.log('Game started with players:', initialPlayers); // Add this line for debugging
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
    this.goDownSubject.next(cards);
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

    const winningPlayer = this.playersSubject.value.find(p => p.id === winningCard.playerId)!;
    const winningTeam = this.getPlayerTeam(winningCard.playerId);

    const currentCounts = this.trickCountsSubject.value;
    currentCounts[winningTeam]++;
    this.trickCountsSubject.next(currentCounts);

    // Calculate points for this trick
    const trickPoints = currentTrick.reduce((sum, playedCard) => sum + this.getCardPoints(playedCard.card), 0);

    // Update current hand points
    const currentHandPoints = this.currentHandPointsSubject.value;
    currentHandPoints[winningTeam] += trickPoints;
    this.currentHandPointsSubject.next(currentHandPoints);

    // Update the score
    const currentScore = this.scoreSubject.value;
    currentScore[winningTeam] += trickPoints;
    this.scoreSubject.next(currentScore);

    // Update trick history
    const trickHistory = this.trickHistorySubject.value;
    trickHistory.push({ cards: currentTrick, winner: winningPlayer });
    this.trickHistorySubject.next(trickHistory);

    // Set the next current player
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
    const trickHistory = this.trickHistorySubject.value;
    const trickCounts = this.trickCountsSubject.value;
    const bidWinner = this.bidWinnerSubject.value!;
    const bidWinnerTeam = this.getPlayerTeam(bidWinner.id);
    const goDown = this.goDownSubject.value;
    const dealer = this.dealerSeatSubject.value;

    // Calculate points from tricks
  const handPoints = { A: 0, B: 0 };
  trickHistory.forEach((trick, index) => {
    const trickPoints = this.calculateTrickPoints(trick.cards);
    const winningTeam = this.getPlayerTeam(trick.winner.id);
    handPoints[winningTeam] += trickPoints;

    // Add go-down points to the team that won the 9th trick
    if (index === 8) {
      handPoints[winningTeam] += this.calculateGoDownPoints(goDown);
    }
  });

  // Add 20 points for the team that won the most tricks
  if (trickCounts.A > trickCounts.B) {
    handPoints.A += 20;
  } else if (trickCounts.B > trickCounts.A) {
    handPoints.B += 20;
  }

  // Evaluate if the bid winner met their bid
  const bidAmount = bidWinner.bid!;
  const bidWinnerPoints = handPoints[bidWinnerTeam];

  let finalHandScore = { A: 0, B: 0 };
  if (bidWinnerPoints >= bidAmount) {
    // Bid winner met or exceeded their bid
    finalHandScore[bidWinnerTeam] = handPoints[bidWinnerTeam];
    finalHandScore[bidWinnerTeam === 'A' ? 'B' : 'A'] = handPoints[bidWinnerTeam === 'A' ? 'B' : 'A'];
  } else {
    // Bid winner didn't meet their bid
    finalHandScore[bidWinnerTeam] = -bidAmount;
    finalHandScore[bidWinnerTeam === 'A' ? 'B' : 'A'] = handPoints[bidWinnerTeam === 'A' ? 'B' : 'A'];
  }

    // Update hand score history
    const handScoreRecord: HandScoreRecord = {
      dealer: this.getPlayerNameBySeat(dealer),
      bidWinner: bidWinner.name,
      winningBid: bidAmount,
      teamAScore: finalHandScore.A,
      teamBScore: finalHandScore.B
    };
    const currentHistory = this.handScoreHistorySubject.value;
    this.handScoreHistorySubject.next([...currentHistory, handScoreRecord]);

    // Update total game score
    this.updateTotalGameScore();

    // Change game phase to 'dealing'
    this.gamePhaseSubject.next('dealing');

    // Rotate dealer
    const currentDealerSeat = this.dealerSeatSubject.value;
    const nextDealerSeat = this.getNextSeat(currentDealerSeat);
    this.dealerSeatSubject.next(nextDealerSeat);

    // Check if the game has ended
    const totalScore = this.scoreSubject.value;
    if (totalScore.A > 500 || totalScore.A < -250 || totalScore.B > 500 || totalScore.B < -250) {
      this.endGame();
    }
  }

  private getPlayerNameBySeat(seat: 'A1' | 'B1' | 'A2' | 'B2'): string {
    const player = this.playersSubject.value.find(p => p.seat === seat);
    return player ? player.name : 'Unknown';
  }

  private calculateTrickPoints(cards: PlayedCard[]): number {
    return cards.reduce((sum, playedCard) => sum + this.getCardPoints(playedCard.card), 0);
  }

  private calculateGoDownPoints(goDown: CardData[]): number {
    return goDown.reduce((sum, card) => sum + this.getCardPoints(card), 0);
  }

  private getCardPoints(card: CardData): number {
    if (card.number === 5) return 5;
    if (card.number === 10 || card.number === 13) return 10;
    return 0;
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

  private prepareNextHand() {
    // Reset for next hand
    this.trickHistorySubject.next([]);
    this.trickCountsSubject.next({ A: 0, B: 0 });
    this.goDownSubject.next([]);
    this.gamePhaseSubject.next('bidding');
    this.currentHandPointsSubject.next({ A: 0, B: 0 });
    // Rotate dealer
    const currentDealerSeat = this.dealerSeatSubject.value;
    const nextDealerSeat = this.getNextSeat(currentDealerSeat);
    this.dealerSeatSubject.next(nextDealerSeat);
    // Deal new hands
    this.startNewGame();
  }

  private getNextSeat(currentSeat: 'A1' | 'B1' | 'A2' | 'B2'): 'A1' | 'B1' | 'A2' | 'B2' {
    const seatOrder: ('A1' | 'B1' | 'A2' | 'B2')[] = ['A1', 'B1', 'A2', 'B2'];
    const currentIndex = seatOrder.indexOf(currentSeat);
    return seatOrder[(currentIndex + 1) % 4];
  }

  redealHand() {
    console.log('Redealing hand...');
    
    this.deckService.shuffleDeck();
    const hands = this.deckService.dealCards(4, 9);
    console.log('New hands dealt:', hands);
  
    if (hands.some(hand => hand.length === 0)) {
      console.error('Error: Some hands are empty. Aborting redeal.');
      return;
    }
  
    const players = this.playersSubject.value.map((player, index) => ({
      ...player,
      hand: [...hands[index]],
      bid: null,
      passed: false,
      goDown: null
    }));
    
    console.log('New players state:', JSON.parse(JSON.stringify(players)));
    this.playersSubject.next(players);
  
    const widow = this.deckService.dealWidow();
    if (widow.length === 0) {
      console.error('Error: Widow is empty. Aborting redeal.');
      return;
    }
    this.widowSubject.next(widow);
    console.log('New widow dealt:', widow);
  
    // Reset other game state
    this.currentBidSubject.next(65);
    this.currentBidderSubject.next(players.find(p => p.seat === this.getNextSeat(this.dealerSeatSubject.value)) || null);
    this.bidWinnerSubject.next(null);
    this.trumpSuitSubject.next(null);
    this.currentHandPointsSubject.next({ A: 0, B: 0 });
    this.trickHistorySubject.next([]);
    this.trickCountsSubject.next({ A: 0, B: 0 });
    this.currentTrickSubject.next([]);
    this.goDownSubject.next([]);
  
    // Set the game phase to bidding
    this.gamePhaseSubject.next('bidding');
    console.log('Game phase set to bidding');
  }

  dealNewHand() {
    if (this.gamePhaseSubject.value !== 'dealing') {
      console.error('Cannot deal new hand: Not in dealing phase');
      return;
    }
  
    this.deckService.shuffleDeck();
    const hands = this.deckService.dealCards(4, 9);
    const players = this.playersSubject.value.map((player, index) => ({
      ...player,
      hand: [...hands[index]],
      bid: null,
      passed: false,
      goDown: null
    }));
    
    // Create a completely new array of player objects
    const newPlayers = players.map(p => ({...p}));
  
    this.playersSubject.next(newPlayers);
    const widow = this.deckService.dealWidow();
    this.widowSubject.next([...widow]);
    this.currentBidSubject.next(65);
    const dealerSeat = this.dealerSeatSubject.value;
    const firstBidderSeat = this.getNextSeat(dealerSeat);
    this.currentBidderSubject.next(newPlayers.find(p => p.seat === firstBidderSeat) || null);
    this.bidWinnerSubject.next(null);
    this.trumpSuitSubject.next(null);
    this.currentHandPointsSubject.next({ A: 0, B: 0 });
    this.trickHistorySubject.next([]);
    this.trickCountsSubject.next({ A: 0, B: 0 });
    this.currentTrickSubject.next([]);
    this.goDownSubject.next([]);
    
    // Ensure the game phase is set to 'bidding' after all other updates
    this.gamePhaseSubject.next('bidding');
  
    console.log('New hand dealt:', newPlayers);
  }
  private endGame() {
    // Implement game end logic
    console.log('Game has ended');
    // You might want to update the UI or trigger some end-game event
  }
}