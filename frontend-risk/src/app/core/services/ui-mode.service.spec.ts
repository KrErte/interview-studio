import { TestBed } from '@angular/core/testing';
import { UiModeService, UiMode } from './ui-mode.service';

describe('UiModeService', () => {
  let service: UiModeService;
  const STORAGE_KEY = 'workforceIntel.uiMode';

  // Mock localStorage
  let mockStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset mock storage
    mockStorage = {};

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockStorage[key] ?? null;
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockStorage[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockStorage[key];
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(UiModeService);
  });

  afterEach(() => {
    mockStorage = {};
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should default to "simple" mode when localStorage is empty', () => {
      expect(service.getMode()).toBe('simple');
      expect(service.isSimple()).toBe(true);
      expect(service.isAdvanced()).toBe(false);
    });

    it('should load "advanced" mode from localStorage if present', () => {
      // Pre-set localStorage before creating a new service instance
      mockStorage[STORAGE_KEY] = 'advanced';

      // Create a new instance that will read from storage
      const newService = new UiModeService();
      expect(newService.getMode()).toBe('advanced');
      expect(newService.isAdvanced()).toBe(true);
      expect(newService.isSimple()).toBe(false);
    });

    it('should load "simple" mode from localStorage if present', () => {
      mockStorage[STORAGE_KEY] = 'simple';

      const newService = new UiModeService();
      expect(newService.getMode()).toBe('simple');
      expect(newService.isSimple()).toBe(true);
    });

    it('should default to "simple" if localStorage contains invalid value', () => {
      mockStorage[STORAGE_KEY] = 'invalid-mode';

      const newService = new UiModeService();
      expect(newService.getMode()).toBe('simple');
    });
  });

  describe('setMode()', () => {
    it('should set mode to "advanced"', () => {
      service.setMode('advanced');
      expect(service.getMode()).toBe('advanced');
      expect(service.isAdvanced()).toBe(true);
      expect(service.isSimple()).toBe(false);
    });

    it('should set mode to "simple"', () => {
      service.setMode('advanced');
      service.setMode('simple');
      expect(service.getMode()).toBe('simple');
      expect(service.isSimple()).toBe(true);
    });

    it('should default to "simple" for invalid mode', () => {
      service.setMode('invalid' as UiMode);
      expect(service.getMode()).toBe('simple');
    });
  });

  describe('toggle()', () => {
    it('should toggle from "simple" to "advanced"', () => {
      expect(service.getMode()).toBe('simple');
      service.toggle();
      expect(service.getMode()).toBe('advanced');
    });

    it('should toggle from "advanced" to "simple"', () => {
      service.setMode('advanced');
      service.toggle();
      expect(service.getMode()).toBe('simple');
    });

    it('should toggle multiple times correctly', () => {
      expect(service.getMode()).toBe('simple');
      service.toggle();
      expect(service.getMode()).toBe('advanced');
      service.toggle();
      expect(service.getMode()).toBe('simple');
      service.toggle();
      expect(service.getMode()).toBe('advanced');
    });
  });

  describe('reset()', () => {
    it('should reset mode to "simple"', () => {
      service.setMode('advanced');
      expect(service.getMode()).toBe('advanced');
      service.reset();
      expect(service.getMode()).toBe('simple');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist mode to localStorage when setMode is called', () => {
      service.setMode('advanced');
      // Effect runs synchronously in test environment
      TestBed.flushEffects();
      expect(mockStorage[STORAGE_KEY]).toBe('advanced');
    });

    it('should persist mode to localStorage when toggle is called', () => {
      service.toggle();
      TestBed.flushEffects();
      expect(mockStorage[STORAGE_KEY]).toBe('advanced');

      service.toggle();
      TestBed.flushEffects();
      expect(mockStorage[STORAGE_KEY]).toBe('simple');
    });

    it('should persist mode to localStorage when reset is called', () => {
      service.setMode('advanced');
      TestBed.flushEffects();
      expect(mockStorage[STORAGE_KEY]).toBe('advanced');

      service.reset();
      TestBed.flushEffects();
      expect(mockStorage[STORAGE_KEY]).toBe('simple');
    });

    it('should use correct storage key "workforceIntel.uiMode"', () => {
      service.setMode('advanced');
      TestBed.flushEffects();
      expect(localStorage.setItem).toHaveBeenCalledWith('workforceIntel.uiMode', 'advanced');
    });
  });

  describe('computed signals', () => {
    it('isSimple() should return true only when mode is "simple"', () => {
      expect(service.isSimple()).toBe(true);
      service.setMode('advanced');
      expect(service.isSimple()).toBe(false);
      service.setMode('simple');
      expect(service.isSimple()).toBe(true);
    });

    it('isAdvanced() should return true only when mode is "advanced"', () => {
      expect(service.isAdvanced()).toBe(false);
      service.setMode('advanced');
      expect(service.isAdvanced()).toBe(true);
      service.setMode('simple');
      expect(service.isAdvanced()).toBe(false);
    });

    it('isSimple() and isAdvanced() should be mutually exclusive', () => {
      expect(service.isSimple()).not.toBe(service.isAdvanced());
      service.toggle();
      expect(service.isSimple()).not.toBe(service.isAdvanced());
    });
  });
});
