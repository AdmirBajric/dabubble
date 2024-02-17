import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserToConversationsComponent } from './add-user-to-conversations.component';

describe('AddUserToConversationsComponent', () => {
  let component: AddUserToConversationsComponent;
  let fixture: ComponentFixture<AddUserToConversationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserToConversationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUserToConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
