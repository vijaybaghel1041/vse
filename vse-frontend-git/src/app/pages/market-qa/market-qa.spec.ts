import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketQa } from './market-qa';

describe('MarketQa', () => {
  let component: MarketQa;
  let fixture: ComponentFixture<MarketQa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketQa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketQa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
