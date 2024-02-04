import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddMemberChannelComponent } from './dialog-add-member-channel.component';

describe('DialogAddMemberChannelComponent', () => {
  let component: DialogAddMemberChannelComponent;
  let fixture: ComponentFixture<DialogAddMemberChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddMemberChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAddMemberChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
