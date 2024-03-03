import { Routes } from '@angular/router';
import { SignUpComponent } from './components/auth/sign-up/sign-up.component';
import { SelectAvatarComponent } from './components/auth/select-avatar/select-avatar.component';
import { PrivacyPolicyComponent } from './components/legal/privacy-policy/privacy-policy.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ImpressumComponent } from './components/legal/impressum/impressum.component';
import { SendMailPwComponent } from './components/auth/send-mail-pw/send-mail-pw.component';
import { ResetPwComponent } from './components/auth/reset-pw/reset-pw.component';
import { AuthGuard } from '../app/guards/auth.guard';
import { CreateChannelComponent } from './components/shared/dialogs/create-channel/create-channel.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { VerificationSuccessComponent } from './components/auth/verification-success/verification-success.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileMenuComponent } from './components/dashboard/profile-menu/profile-menu.component';
import { MainChatComponent } from './components/chat/main-chat/main-chat.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'send-mail-pw', component: SendMailPwComponent },
  { path: 'reset-pw', component: ResetPwComponent },
  { path: 'sign-up', component: SignUpComponent },
  {
    path: 'select-avatar',
    component: SelectAvatarComponent,
    canActivate: [AuthGuard],
  },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'verification-success', component: VerificationSuccessComponent },
  {
    path: 'create-channel',
    component: CreateChannelComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'profile', component: ProfileMenuComponent },
  { path: 'main-chat', component: MainChatComponent },
];
