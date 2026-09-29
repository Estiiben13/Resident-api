import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ResidentEvilCharacter } from '../models/resident-evil-character';

interface FandomPage {
  pageid: number;
  title: string;
  thumbnail?: { source: string };
}

interface FandomResponse {
  query?: { pages?: Record<string, FandomPage> };
}

@Injectable({ providedIn: 'root' })
export class ResidentEvilService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://residentevil.fandom.com/api.php';
  private readonly featuredNames = [
    'Leon Scott Kennedy',
    'Jill Valentine',
    'Chris Redfield',
    'Claire Redfield',
    'Ada Wong',
    'Albert Wesker',
    'Ethan W.',
    'Rebecca Chambers',
    'Barry Burton',
    'Carlos M.',
    'Ashley Graham',
    'Sherry Birkin',
    'HUNK',
  ];
  private readonly categories = [
    { title: 'Resident_Evil_2_characters', game: 'Resident Evil 2' },
    { title: 'Resident_Evil_4_characters', game: 'Resident Evil 4' },
    { title: 'Resident_Evil_5_characters', game: 'Resident Evil 5' },
    { title: 'Resident_Evil_6_characters', game: 'Resident Evil 6' },
    { title: 'Resident_Evil_Village_characters', game: 'Resident Evil Village' },
    { title: 'Raccoon_citizens', game: 'Raccoon City' },
    { title: 'Playable_characters', game: 'Personajes jugables' },
  ];

  getCharacters(): Observable<ResidentEvilCharacter[]> {
    const requests = this.categories.map(({ title, game }) => {
      const params = new HttpParams()
        .set('action', 'query')
        .set('generator', 'categorymembers')
        .set('gcmtitle', `Category:${title}`)
        .set('gcmtype', 'page')
        .set('gcmnamespace', '0')
        .set('gcmlimit', '50')
        .set('prop', 'pageimages')
        .set('piprop', 'thumbnail')
        .set('pithumbsize', '640')
        .set('format', 'json')
        .set('origin', '*');

      return this.http.get<FandomResponse>(this.apiUrl, { params }).pipe(
        map((response) =>
          Object.values(response.query?.pages ?? {})
            .filter((page) => page.thumbnail?.source && !this.isCrossover(page.title))
            .map((page) => ({
              id: page.pageid,
              name: page.title,
              image: page.thumbnail!.source,
              game,
              wikiUrl: `https://residentevil.fandom.com/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
            })),
        ),
      );
    });

    return forkJoin(requests).pipe(
      map((collections) => {
        const characters = new Map<number, ResidentEvilCharacter>();
        collections.flat().forEach((character) => {
          if (!characters.has(character.id)) characters.set(character.id, character);
        });
        const featuredOrder = new Map(this.featuredNames.map((name, index) => [name, index]));
        return Array.from(characters.values()).sort((a, b) => {
          const aOrder = featuredOrder.get(a.name) ?? Number.MAX_SAFE_INTEGER;
          const bOrder = featuredOrder.get(b.name) ?? Number.MAX_SAFE_INTEGER;
          return aOrder - bOrder || a.name.localeCompare(b.name, 'es');
        });
      }),
    );
  }

  private isCrossover(title: string): boolean {
    return /\((?:dead by daylight|nikke|fortnite|teppen)/i.test(title);
  }
}