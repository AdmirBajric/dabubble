import { Routes } from '@angular/router';
import { SignUpComponent } from './components/auth/sign-up/sign-up.component';
import { SelectAvatarComponent } from './components/auth/select-avatar/select-avatar.component';
import { PrivacyPolicyComponent } from './components/legal/privacy-policy/privacy-policy.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ImpressumComponent } from './components/legal/impressum/impressum.component';
import { SendMailPwComponent } from './components/auth/send-mail-pw/send-mail-pw.component';
import { ResetPwComponent } from './components/auth/reset-pw/reset-pw.component';
import { WorkspaceComponent } from './components/dashboard/workspace/workspace.component';
import { ForTestComponent } from './for-test/for-test.component';
import { CreateChannelComponent } from './create-channel/create-channel.component';
import { EmojisComponent } from './components/shared/emojis/emojis.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { VerificationSuccessComponent } from './components/auth/verification-success/verification-success.component';
import { AuthGuard } from '../app/guards/auth.guard';
import { TestSignOutComponent } from './test-sign-out/test-sign-out.component';

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
    path: 'workspace',
    component: WorkspaceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'create-channel',
    component: CreateChannelComponent,
    canActivate: [AuthGuard],
  },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'for-testing', component: ForTestComponent },
  { path: 'emoji', component: EmojisComponent },
  { path: 'sign-out', component: TestSignOutComponent },
];
