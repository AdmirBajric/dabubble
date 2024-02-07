import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageHoverActionsComponent } from './message-hover-actions.component';

describe('MessageHoverActionsComponent', () => {
  let component: MessageHoverActionsComponent;
  let fixture: ComponentFixture<MessageHoverActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageHoverActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageHoverActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
