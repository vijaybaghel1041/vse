import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VseFormComponent } from './vse-form.component';
import { VseService } from '../../services/vse.service';

describe('VseFormComponent', () => {
  let component: VseFormComponent;
  let fixture: ComponentFixture<VseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VseFormComponent, RouterModule.forRoot([]), HttpClientTestingModule],
      providers: [VseService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
