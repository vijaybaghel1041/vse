import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MarketQa } from './market-qa';

describe('MarketQa', () => {
  let component: MarketQa;
  let fixture: ComponentFixture<MarketQa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketQa, RouterModule.forRoot([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketQa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
