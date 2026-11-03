import { Component, signal } from '@angular/core';
import {TiptapEditor} from './components/tiptap-editor/tiptap-editor';

@Component({
  selector: 'app-root',
  imports: [TiptapEditor],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('poc-tiptap-editor');
}
