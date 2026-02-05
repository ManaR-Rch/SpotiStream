import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { TrackEffects } from './track.effects';
import * as TrackActions from './track.actions';
import { ApiService } from '../../services/backend/api.service';
import { IndexedDbStorageService } from '../../services/indexed-db-storage.service';
import { StorageService } from '../../services/storage.service';
import { Track } from '../../models/track.model';

describe('TrackEffects', () => {
  let effects: TrackEffects;
  let actions$: Observable<any>;
  let store: MockStore;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let indexedDbServiceSpy: jasmine.SpyObj<IndexedDbStorageService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  const mockTracks: Track[] = [
    {
      id: '1',
      title: 'Test Track 1',
      artist: 'Test Artist',
      duration: 180,
      category: 'pop',
      addedDate: new Date(),
    },
    {
      id: '2',
      title: 'Test Track 2',
      artist: 'Another Artist',
      duration: 240,
      category: 'rock',
      addedDate: new Date(),
    },
  ];

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getAllTracks',
      'createTrack',
      'updateTrack',
      'deleteTrack',
    ]);
    indexedDbServiceSpy = jasmine.createSpyObj('IndexedDbStorageService', [
      'storeAudioFile',
      'storeCoverImage',
      'deleteAllTrackFiles',
    ]);
    storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getTracks',
      'addTrack',
      'updateTrack',
      'deleteTrack',
      'saveTrackOrder',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TrackEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: IndexedDbStorageService, useValue: indexedDbServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    });

    effects = TestBed.inject(TrackEffects);
    store = TestBed.inject(MockStore);
  });

  describe('loadTracks$', () => {
    it('should return loadTracksSuccess with tracks from API', (done) => {
      const apiResponse: Track[] = [
        { id: '1', title: 'Test', artist: 'Artist', duration: 180, category: 'pop', addedDate: new Date() },
      ];
      apiServiceSpy.getAllTracks.and.returnValue(of(apiResponse as any));

      actions$ = of(TrackActions.loadTracks());

      effects.loadTracks$.subscribe((action) => {
        expect(action.type).toBe('[Track API] Load Tracks Success');
        expect(apiServiceSpy.getAllTracks).toHaveBeenCalled();
        done();
      });
    });

    it('should fallback to localStorage when API fails', (done) => {
      apiServiceSpy.getAllTracks.and.returnValue(
        throwError(() => new Error('API Error'))
      );
      storageServiceSpy.getTracks.and.returnValue(mockTracks);

      actions$ = of(TrackActions.loadTracks());

      effects.loadTracks$.subscribe((action) => {
        expect(action.type).toBe('[Track API] Load Tracks Success');
        expect(storageServiceSpy.getTracks).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('deleteTrack$', () => {
    it('should delete track and return success', (done) => {
      indexedDbServiceSpy.deleteAllTrackFiles.and.returnValue(Promise.resolve());
      storageServiceSpy.deleteTrack.and.stub();
      apiServiceSpy.deleteTrack.and.returnValue(of(undefined));

      actions$ = of(TrackActions.deleteTrack({ id: '1' }));

      effects.deleteTrack$.subscribe((action) => {
        expect(action.type).toBe('[Track API] Delete Track Success');
        expect(indexedDbServiceSpy.deleteAllTrackFiles).toHaveBeenCalledWith('1');
        expect(storageServiceSpy.deleteTrack).toHaveBeenCalledWith('1');
        done();
      });
    });
  });
});
