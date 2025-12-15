import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FitIndicatorComponent } from './fit-indicator.component';

describe('FitIndicatorComponent', () => {
  let fixture: ComponentFixture<FitIndicatorComponent>;
  let component: FitIndicatorComponent;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FitIndicatorComponent]
    });

    fixture = TestBed.createComponent(FitIndicatorComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
  });

  function textContent(): string {
    return (element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  it('questionCount=2 -> shows exploration message, no percent, no trend', () => {
    component.questionCount = 2;
    component.computed = false;
    component.overall = null;

    fixture.detectChanges();

    const text = textContent();
    expect(text).toContain('Tutvume sinuga');
    expect(text).not.toContain('Sobivus:');
    expect(text).not.toMatch(/\d+%/);
    expect(text).not.toContain('Tõusuteel');
    expect(text).not.toContain('Languses');
  });

  it('questionCount=3, computed=true, overall=55 -> shows Sobivus 55%', () => {
    component.questionCount = 3;
    component.computed = true;
    component.overall = 55;

    fixture.detectChanges();

    const text = textContent();
    expect(text).toContain('Sobivus:');
    expect(text).toContain('55%');
    expect(text).not.toContain('Tutvume sinuga');
  });

  it('questionCount=4, trend present -> still no trend badge', () => {
    component.questionCount = 4;
    component.computed = true;
    component.overall = 60;
    component.trend = 'IMPROVING';

    fixture.detectChanges();

    const text = textContent();
    expect(text).toContain('Sobivus:');
    expect(text).not.toContain('Tõusuteel');
    expect(text).not.toContain('Languses');
    expect(text).not.toContain('↑');
    expect(text).not.toContain('↓');
  });

  it('questionCount=5, trend="IMPROVING" -> shows trend badge', () => {
    component.questionCount = 5;
    component.computed = true;
    component.overall = 60;
    component.trend = 'IMPROVING';

    fixture.detectChanges();

    const text = textContent();
    expect(text).toContain('Sobivus:');
    expect(text).toContain('60%');
    expect(text).toContain('Tõusuteel');
    expect(text).toContain('↑');
  });
});


