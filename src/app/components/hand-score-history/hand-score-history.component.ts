import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HandScoreRecord {
  dealer: string;
  bidWinner: string;
  winningBid: number;
  teamAScore: number;
  teamBScore: number;
}

@Component({
  selector: 'app-hand-score-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hand-score-history">
      <h3>Hand Score History</h3>
      <table>
        <thead>
          <tr>
            <th>Dealer</th>
            <th>Bid Winner</th>
            <th>Winning Bid</th>
            <th>Team A Score</th>
            <th>Team B Score</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let record of history">
            <td>{{ record.dealer }}</td>
            <td>{{ record.bidWinner }}</td>
            <td>{{ record.winningBid }}</td>
            <td>{{ record.teamAScore }}</td>
            <td>{{ record.teamBScore }}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3">Total</td>
            <td>{{ getTotalScore('A') }}</td>
            <td>{{ getTotalScore('B') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .hand-score-history {
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    .total-row {
      font-weight: bold;
      background-color: #e6e6e6;
    }
  `]
})
export class HandScoreHistoryComponent {
  @Input() history: HandScoreRecord[] = [];

  getTotalScore(team: 'A' | 'B'): number {
    return this.history.reduce((total, record) => 
      total + (team === 'A' ? record.teamAScore : record.teamBScore), 0);
  }
}