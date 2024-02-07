import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestMessagesComponent } from './test-messages.component';

describe('TestMessagesComponent', () => {
  let component: TestMessagesComponent;
  let fixture: ComponentFixture<TestMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestMessagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
