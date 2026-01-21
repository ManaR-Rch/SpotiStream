import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AudioPlayerComponent } from './components/audio-player.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AudioPlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MusicStream';
}
