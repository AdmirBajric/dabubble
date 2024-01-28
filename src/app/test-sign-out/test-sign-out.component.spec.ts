import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSignOutComponent } from './test-sign-out.component';

describe('TestSignOutComponent', () => {
  let component: TestSignOutComponent;
  let fixture: ComponentFixture<TestSignOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSignOutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestSignOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
