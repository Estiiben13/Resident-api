import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResidentEvilService } from './services/resident-evil.service';
import { ResidentEvilCharacter } from './models/resident-evil-character';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly residentEvilService = inject(ResidentEvilService);
  protected readonly characters = signal<ResidentEvilCharacter[]>([]);
  protected readonly unavailableImageIds = signal(new Set<number>());
  protected readonly searchTerm = signal('');
  protected readonly selectedCharacter = signal<ResidentEvilCharacter | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly filteredCharacters = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const charactersWithImages = this.characters().filter(
      (character) => !this.unavailableImageIds().has(character.id),
    );
    if (!term) return charactersWithImages;
    return charactersWithImages.filter((character) =>
      character.name.toLowerCase().includes(term) || character.id.toString() === term,
    );
  });

  constructor() {
    this.loadCharacters();
  }

  protected loadCharacters(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.unavailableImageIds.set(new Set());
    this.residentEvilService.getCharacters().subscribe({
      next: (data) => {
        this.characters.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron recuperar los expedientes. Comprueba tu conexión e inténtalo de nuevo.');
        this.isLoading.set(false);
      },
    });
  }

  protected openModal(character: ResidentEvilCharacter): void {
    this.selectedCharacter.set(character);
  }

  protected omitCharacterWithoutImage(character: ResidentEvilCharacter): void {
    this.unavailableImageIds.update((ids) => new Set(ids).add(character.id));
    if (this.selectedCharacter()?.id === character.id) this.closeModal();
  }

  protected closeModal(): void {
    this.selectedCharacter.set(null);
  }
}
