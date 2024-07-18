import { Component } from '@angular/core';
<<<<<<< HEAD
import { GameComponent } from './components/game/game.component';
=======
import { CommonModule } from '@angular/common';
import { GameComponent } from './game/game.component';
>>>>>>> 7fe72b2e11581fc3e200e395f18963ab9f008448

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [GameComponent],
  template: '<app-game></app-game>',
  styles: []
})
export class AppComponent { }
=======
  imports: [CommonModule, GameComponent],
  template: `
    <div class="app-container">
      <app-game></app-game>
    </div>
  `,
  styles: [`
    .app-container {
      padding: 20px;
    }
  `]
})
export class AppComponent {
  title = 'rook-03';
}
>>>>>>> 7fe72b2e11581fc3e200e395f18963ab9f008448
