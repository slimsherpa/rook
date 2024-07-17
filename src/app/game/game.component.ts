// game.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DeckService } from '../deck.service';
import { CardComponent, CardData } from '../card/card.component';
import { BiddingComponent } from '../bidding/bidding.component';
import { BiddingControlComponent } from '../bidding-control/bidding-control.component';
import { SetGoDownComponent } from '../set-go-down/set-go-down.component';
import { TrumpSelectionComponent } from '../trump-selection/trump-selection.component';
import { TrickComponent } from '../trick/trick.component';
import { TrickHistoryComponent } from '../trick-history/trick-history.component';
import { PlayerHandComponent } from '../player-hand/player-hand.component';
import { PlayerComponent } from '../player/player.component';

interface Player {
  id: number;
  name: string;
  seat: 'A1' | 'B1' | 'A2' | 'B2';
  hand: CardData[];
}

interface Team {
  name: 'A' | 'B';
  players: [Player, Player];
  score: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    PlayerComponent,
    CardComponent,
    BiddingComponent,
    BiddingControlComponent,
    SetGoDownComponent,
    TrumpSelectionComponent,
    TrickComponent,
    TrickHistoryComponent,
    PlayerHandComponent,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Schlappi Rook Card Game</span>
    </mat-toolbar>
    <mat-card class="game-status">
      <mat-card-content>
        <p>Game Started: {{ gameStarted }}</p>
        <p>Dealer: {{ getDealer() }}</p>
        <p>Bidding In Progress: {{ biddingInProgress }}</p>
        <p>{{ getGameStatus() }}</p>
        <p *ngIf="bidWinner">Bid Winner: {{ bidWinner.name }}</p>
        <p *ngIf="winningBid !== null">Winning Bid: {{ winningBid }}</p>
        <p *ngIf="winningBid !== null">Trump: {{ getTrumpSuit() }}</p>
        <p>Current Player: {{ currentPlayer?.name }}</p>
        <p>Lead Suit: {{ getLeadSuit() }}</p>
        <p>First Player of Trick: {{ currentPlayer && isFirstPlayerOfTrick(currentPlayer) ? 'Yes' : 'No' }}</p>
[isCurrentPlayer]="player.id === currentPlayer?.id"
      </mat-card-content>
    </mat-card>
    
    <mat-card *ngIf="gameStarted">
      <mat-card-content>
        <div *ngFor="let team of teams">
          <h2>Team {{ team.name }}</h2>
          <p>Score: {{ team.score }}</p>
          <app-player *ngFor="let player of team.players" [player]="player"></app-player>
        </div>
        
        <div class="widow">
          <h3>Widow</h3>
          <div class="widow-cards">
            <app-card *ngFor="let card of widow" [card]="card"></app-card>
          </div>
        </div>


        <div *ngIf="biddingInProgress" class="bidding-section">
      <h2>Bidding Phase</h2>
      <p>Current Highest Bid: {{ currentBid === null ? 'No bid yet' : currentBid }}</p>
      <p>Passed Players: {{ getPassedPlayerNames() }}</p>
      <app-bidding-control
        *ngFor="let seat of seats"
        [seat]="seat"
        [playerName]="getPlayerBySeat(seat)?.name || 'Unknown'"
        [isCurrentBidder]="currentBidderSeat === seat"
        [currentBid]="currentBid"
        (pass)="onPass()"
        (bid)="onBid($event)"
      ></app-bidding-control>

      <app-set-go-down 
        [player]="bidWinner!" 
        (goDownSet)="onGoDownSet($event)"
      ></app-set-go-down>

      <app-trump-selection
        (trumpSelected)="onTrumpSelected($event)"
      ></app-trump-selection>

      <app-player-hand 
        *ngFor="let player of getAllPlayers()"
        [player]="player"
        [isCurrentPlayer]="player.id === currentPlayer?.id"
        [leadSuit]="getLeadSuit()"
        [trumpSuit]="trumpSuit"
        [isFirstPlayer]="isFirstPlayerOfTrick(player)"
        (cardPlayed)="onCardPlayed($event)"
      ></app-player-hand>

    <app-trick-history [tricks]="trickHistory"></app-trick-history>
</div>

    <ng-template #lobby>
      <mat-card>
        <mat-card-content>
          <h2>Waiting for players...</h2>
        </mat-card-content>
      </mat-card>

    <!-- ... other template content -->
  `,
  styles: [`
    mat-card {
      margin: 20px;
    }
    .widow {
      margin-top: 20px;
      padding: 10px;
      background-color: #f0f0f0;
      border-radius: 5px;
    }
    .widow-cards {
      display: flex;
      justify-content: center;
    }
    .bidding-section {
      margin-top: 20px;
      padding: 20px;
      background-color: #e0e0e0;
      border-radius: 5px;
    }
    .game-status {
      margin: 20px;
      padding: 10px;
    }
  `]
})
export class GameComponent implements OnInit {
  gameStarted = true;
  seats: ('A1' | 'B1' | 'A2' | 'B2')[] = ['A1', 'B1', 'A2', 'B2'];
  teams: Team[] = [];
  dealer: Player | null = null;
  dealerSeat: 'A1' | 'B1' | 'A2' | 'B2' = 'A2'; // Starting dealer seat
  gamePhase: 'bidding' | 'setGoDown' | 'selectTrump' | 'playTricks' = 'bidding';
  widow: CardData[] = [];
  biddingInProgress = false;
  currentBidder: Player | null = null;
  passedPlayers: Player[] = [];
  currentBidderSeat: 'A1' | 'B1' | 'A2' | 'B2' | null = null;
  currentBid: number | null = null;
  winningBid: number | null = null;
  bidWinner: Player | null = null;
  trumpSuit: 'Red' | 'Yellow' | 'Black' | 'Green' | null = null;
  currentTrick: {player: string, card: CardData}[] = [];
  trickHistory: {cards: {player: string, card: CardData}[], winner: string}[] = [];
  currentPlayer: Player | null = null;
  trickLeader: Player | null = null;
  trickNumber: number = 1;

  constructor(private deckService: DeckService) {}

  ngOnInit() {
    this.initializeTeams();
    this.startGame();
  }

  initializeTeams() {
    const player1: Player = { id: 1, name: 'Player 1', seat: 'A1', hand: [] };
    const player2: Player = { id: 2, name: 'Player 2', seat: 'B1', hand: [] };
    const player3: Player = { id: 3, name: 'Player 3', seat: 'A2', hand: [] };
    const player4: Player = { id: 4, name: 'Player 4', seat: 'B2', hand: [] };

    this.teams = [
      { name: 'A', players: [player1, player3], score: 0 },
      { name: 'B', players: [player2, player4], score: 0 }
    ];
  }

  startGame() {
    this.gameStarted = true;
    this.dealCards();
    this.startBidding();
  }

  getNextSeat(currentSeat: 'A1' | 'B1' | 'A2' | 'B2'): 'A1' | 'B1' | 'A2' | 'B2' {
    const currentIndex = this.seats.indexOf(currentSeat);
    return this.seats[(currentIndex + 1) % this.seats.length];
  }

  getPlayerBySeat(seat: 'A1' | 'B1' | 'A2' | 'B2'): Player | null {
    return this.teams.flatMap(team => team.players).find(player => player.seat === seat) || null;
  }

  selectDealer() {
    // For now, let's randomly select a dealer
    const allPlayers = this.teams.flatMap(team => team.players);
    this.dealer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
  }

  getDealer(): string {
    const dealer = this.getPlayerBySeat(this.dealerSeat);
    return dealer ? `${dealer.name} (Seat ${this.dealerSeat})` : 'Not set';
  }

  getPlayerClockwiseOfDealer(): Player {
    const dealerIndex = this.seats.indexOf(this.dealerSeat);
    const nextSeat = this.seats[(dealerIndex + 1) % this.seats.length];
    return this.getPlayerBySeat(nextSeat)!;
  }

  dealCards() {
    const hands = this.deckService.dealCards(4, 9);
    this.teams.forEach((team, index) => {
      team.players[0].hand = hands[index * 2];
      team.players[1].hand = hands[index * 2 + 1];
    });
    this.widow = this.deckService.dealWidow();
  }

  startBidding() {
    this.biddingInProgress = true;
    this.currentBid = null;
    this.passedPlayers = [];
    this.currentBidderSeat = this.getNextSeat(this.dealerSeat);
    this.currentBidder = this.getPlayerBySeat(this.currentBidderSeat);
  }

    getNextBidder(): Player | null {
    let nextSeat = this.getNextSeat(this.currentBidderSeat!);
    let nextPlayer = this.getPlayerBySeat(nextSeat);

    while (nextPlayer && this.passedPlayers.includes(nextPlayer)) {
      nextSeat = this.getNextSeat(nextSeat);
      nextPlayer = this.getPlayerBySeat(nextSeat);
    }

    if (nextPlayer && !this.passedPlayers.includes(nextPlayer)) {
      this.currentBidderSeat = nextSeat;
      return nextPlayer;
    }

    return null;
  }

  onBid(amount: number) {
    if (this.currentBidder && (this.currentBid === null || amount > this.currentBid)) {
      this.currentBid = amount;
      this.moveToNextBidder();
    }
  }

  onPass() {
    if (this.currentBidder) {
      this.passedPlayers.push(this.currentBidder);
      this.moveToNextBidder();
    }
  }

  moveToNextBidder() {
    this.currentBidderSeat = this.getNextSeat(this.currentBidderSeat!);
    this.currentBidder = this.getPlayerBySeat(this.currentBidderSeat);
    
    // Check if we've come full circle
    if (this.passedPlayers.length === 3 || !this.currentBidder) {
      this.endBidding();
    }
  }

  getPassedPlayerNames(): string {
    return this.passedPlayers.map(player => player.name).join(', ');
  }

  endBidding() {
    this.biddingInProgress = false;
    this.bidWinner = this.currentBidder;
    this.winningBid = this.currentBid;
    console.log('Bidding ended. Winner:', this.bidWinner?.name, 'Winning bid:', this.currentBid);
    this.moveToSetGoDownPhase();
  }

  moveToSetGoDownPhase() {
    if (this.bidWinner && this.widow.length > 0) {
      this.bidWinner.hand = [...this.bidWinner.hand, ...this.widow];
      this.widow = [];
      this.gamePhase = 'setGoDown';
    } else {
      console.error('Cannot move to SetGoDown phase: No bid winner or widow is empty');
    }
  }

  onGoDownSet(goDown: CardData[]) {
    if (this.bidWinner) {
      this.bidWinner.hand = this.bidWinner.hand.filter(card => !goDown.includes(card));
      console.log('Go Down set:', goDown);
      console.log('Remaining hand:', this.bidWinner.hand);
      this.gamePhase = 'selectTrump';
    }
  }

  getTrumpSuit(): string {
    return this.trumpSuit ?? 'Not selected';
  }

  onTrumpSelected(suit: 'Red' | 'Yellow' | 'Black' | 'Green') {
    this.trumpSuit = suit;
    console.log('Trump suit selected:', this.trumpSuit);
    // Move to the next phase of the game (e.g., playing tricks)
    this.startTrickPhase();
  }

  startTrickPhase() {
    console.log('Starting trick phase');
    this.gamePhase = 'playTricks';
    this.trickNumber = 1;
    this.currentPlayer = this.getPlayerClockwiseOfDealer();
    this.trickLeader = this.currentPlayer;
    console.log('Current player:', this.currentPlayer?.name);
    this.playTrick();
  }

  isFirstPlayerOfTrick(player: Player): boolean {
    return this.currentTrick.length === 0 && player === this.currentPlayer;
  }

  playTrick() {
    this.currentTrick = [];
    this.currentPlayer = this.trickLeader;
    console.log('New trick started. Current player:', this.currentPlayer?.name);
  }

  getLeadSuit(): string | null {
    return this.currentTrick.length > 0 ? this.currentTrick[0].card.suit : null;
  }

  promptPlayerForCard() {
    // This method would typically interact with the UI to allow the current player to select a card
    // For now, we'll just log a message
  }

  onCardPlayed(card: CardData) {
    console.log('Card played:', card);
    if (this.currentPlayer) {
      this.currentTrick.push({player: this.currentPlayer.name, card: card});
      this.removeCardFromPlayerHand(this.currentPlayer, card);
  
      if (this.currentTrick.length === 4) {  // Changed from 9 to 4
        this.resolveTrick();
      } else {
        this.currentPlayer = this.getNextPlayer();
        console.log('Next player:', this.currentPlayer.name);
      }
    } else {
      console.error('No current player set');
    }
  }

  removeCardFromPlayerHand(player: Player, card: CardData) {
    player.hand = player.hand.filter(c => c !== card);
  }

  resolveTrick() {
    const winner = this.determineWinner();
    this.trickHistory.push({cards: this.currentTrick, winner: winner.name});
    this.currentPlayer = winner;
    this.trickLeader = winner;
    this.currentTrick = [];
    this.trickNumber++;

    if (this.trickNumber <= 9) {
      this.playTrick();
    } else {
      this.endHand();
    }
  }

  determineWinner(): Player {
    // Implement logic to determine the winner of the trick
    // For now, just return the first player as a placeholder
    return this.getAllPlayers()[0];
  }

  getNextPlayer(): Player {
    const currentIndex = this.seats.indexOf(this.currentPlayer!.seat);
    const nextSeat = this.seats[(currentIndex + 1) % this.seats.length];
    return this.getPlayerBySeat(nextSeat)!;
  }

  endHand() {
    // Implement logic to end the hand, calculate scores, etc.
    console.log('Hand ended');
    this.gamePhase = 'bidding'; // Reset to bidding phase for the next hand
  }

  getAllPlayers(): Player[] {
    return this.teams.flatMap(team => team.players);
  }

  getGameStatus(): string {
    if (this.biddingInProgress) {
      return `Current Bidder: ${this.currentBidder?.name || 'None'}`;
    } else if (this.bidWinner) {
      return `Current Bidder: ${this.currentBidder?.name || 'None'}, Bid Winner: ${this.bidWinner.name}`;
    } else {
      return 'Waiting to start';
    }
  }

}