import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUserListComponent } from './user-list.component';

describe('DialogUserListComponent', () => {
  let component: DialogUserListComponent;
  let fixture: ComponentFixture<DialogUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogUserListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
