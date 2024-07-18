import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { GameService, Player, TrumpSuit, PlayedCard, Trick } from '../../services/game.service';
import { PlayerComponent } from '../player/player.component';
import { CardComponent, CardData } from '../card/card.component';
import { TrickComponent } from '../trick/trick.component';
import { TrickHistoryComponent } from '../trick-history/trick-history.component';
import { HandScoreHistoryComponent, HandScoreRecord } from '../hand-score-history/hand-score-history.component';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [NgFor, 
    NgIf, 
    AsyncPipe, 
    PlayerComponent, 
    CardComponent, 
    TrickComponent, 
    TrickHistoryComponent,
    HandScoreHistoryComponent
  ],
  template: `
    <div class="game-board">
  <h2>Rook Game</h2>
  <button (click)="startNewGame()">Start New Game</button>
  <div *ngIf="gameState$ | async as gameState">
    <h3>Current Phase: {{ gameState.gamePhase }}</h3>
    <div class="players">
      <app-player 
        *ngFor="let player of gameState.players" 
        [player]="player"
        [isCurrentPlayer]="player.id === gameState.currentPlayer?.id"
        [isCurrentBidder]="player.id === gameState.currentBidder?.id"
        [isDealer]="player.seat === gameState.dealerSeat"
        [isSelectingGoDown]="gameState.gamePhase === 'selectingGoDown' && player.id === gameState.bidWinner?.id"
        [isSelectingTrump]="gameState.gamePhase === 'selectingTrump' && player.id === gameState.bidWinner?.id"
        [gamePhase]="gameState.gamePhase"
        [minBid]="gameState.currentBid + 5"
        [leadSuit]="gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card.suit : null"
        [isFirstPlayerOfTrick]="gameState.currentTrick.length === 0"
        (bid)="onBid(player.id, $event)"
        (goDown)="onGoDown(player.id, $event)"
        (trumpSelected)="onTrumpSelected($event)"
        (cardPlayed)="onCardPlayed(player.id, $event)"
        (dealNewHandRequest)="onDealNewHand()"
        (redealRequest)="onRedealRequest()"
      ></app-player>
    </div>
    <app-trick 
          *ngIf="gameState.gamePhase === 'playingTricks'"
          [playedCards]="gameState.currentTrick"
          [leadSuit]="gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card.suit : null"
          [trumpSuit]="gameState.trumpSuit"
        ></app-trick>
        <div *ngIf="gameState.gamePhase === 'playingTricks'" class="current-hand-points">
          <h4>Current Hand Points</h4>
          <p>Team A: {{ gameState.currentHandPoints.A }} points</p>
          <p>Team B: {{ gameState.currentHandPoints.B }} points</p>
        </div>
        <app-trick-history
          [tricks]="gameState.trickHistory"
          [goDown]="gameState.goDown"
        ></app-trick-history>
        <app-hand-score-history
          [history]="gameState.handScoreHistory"
        ></app-hand-score-history>
        <div>
          <h3>Total Game Score</h3>
          <p>Team A: {{ gameState.score.A }}</p>
          <p>Team B: {{ gameState.score.B }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-board {
      padding: 20px;
    }
    .players {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .widow {
      margin-top: 20px;
      border: 1px solid #ccc;
      padding: 10px;
    }
  `]
})
export class GameComponent implements OnInit {
  gameState$: Observable<{
    players: Player[];
    currentPlayer: Player | null;
    currentBidder: Player | null;
    dealerSeat: 'A1' | 'B1' | 'A2' | 'B2';
    bidWinner: Player | null;
    gamePhase: 'dealing' | 'bidding' | 'selectingGoDown' | 'selectingTrump' | 'playingTricks';
    currentTrick: PlayedCard[];
    trumpSuit: TrumpSuit;
    score: { A: number, B: number };
    currentBid: number;
    trickHistory: Trick[];
    handScoreHistory: HandScoreRecord[];
    goDown: CardData[];
    currentHandPoints: { A: number, B: number };
  }>;

  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef
  ){
    this.gameState$ = combineLatest([
      this.gameService.players$,
      this.gameService.currentPlayer$,
      this.gameService.currentBidder$,
      this.gameService.bidWinner$,
      this.gameService.gamePhase$,
      this.gameService.currentTrick$,
      this.gameService.trumpSuit$,
      this.gameService.score$,
      this.gameService.currentBid$,
      this.gameService.trickHistory$,
      this.gameService.handScoreHistory$,
      this.gameService.goDown$,
      this.gameService.dealerSeat$,
      this.gameService.currentHandPoints$
    ]).pipe(
      map(([
        players,
        currentPlayer,
        currentBidder,
        bidWinner,
        gamePhase,
        currentTrick,
        trumpSuit,
        score,
        currentBid,
        trickHistory,
        handScoreHistory,
        goDown,
        dealerSeat,
        currentHandPoints
      ]) => ({
        players,
        currentPlayer,
        currentBidder,
        bidWinner,
        gamePhase,
        currentTrick,
        trumpSuit,
        score,
        currentBid,
        trickHistory,
        handScoreHistory,
        goDown,
        dealerSeat,
        currentHandPoints
      }))
    );
  }

  ngOnInit() {
    this.startNewGame();
  }

  startNewGame() {
    this.gameService.startNewGame();
  }

  onDealNewHand() {
    this.gameService.dealNewHand();
  }

  onBid(playerId: number, bid: number | null) {
    this.gameService.placeBid(playerId, bid);
  }

  onGoDown(playerId: number, cards: CardData[]) {
    this.gameService.setGoDown(playerId, cards);
  }

  onTrumpSelected(suit: TrumpSuit) {
    this.gameService.selectTrump(suit);
  }

  onCardPlayed(playerId: number, card: CardData) {
    this.gameService.playCard(playerId, card);
  }

  onRedealRequest() {
    console.log('Redeal requested');
    this.gameService.redealHand();
    this.cdr.detectChanges();
  }

}