import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDesktopDialogComponent } from './profile-desktop-dialog.component';

describe('ProfileDesktopDialogComponent', () => {
  let component: ProfileDesktopDialogComponent;
  let fixture: ComponentFixture<ProfileDesktopDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDesktopDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileDesktopDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
