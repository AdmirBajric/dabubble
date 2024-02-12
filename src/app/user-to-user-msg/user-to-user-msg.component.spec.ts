import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserToUserMsgComponent } from './user-to-user-msg.component';

describe('UserToUserMsgComponent', () => {
  let component: UserToUserMsgComponent;
  let fixture: ComponentFixture<UserToUserMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserToUserMsgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserToUserMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
