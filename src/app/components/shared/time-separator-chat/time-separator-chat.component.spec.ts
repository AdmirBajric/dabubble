import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSeparatorChatComponent } from './time-separator-chat.component';

describe('TimeSeparatorChatComponent', () => {
  let component: TimeSeparatorChatComponent;
  let fixture: ComponentFixture<TimeSeparatorChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSeparatorChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeSeparatorChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
