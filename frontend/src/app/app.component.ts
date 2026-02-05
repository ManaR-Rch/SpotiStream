import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AudioPlayerComponent } from './components/audio-player.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AudioPlayerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MusicStream';
}
