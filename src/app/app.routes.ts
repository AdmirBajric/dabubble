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
import { AuthGuard } from '../app/guards/auth.guard';
import { TestSignOutComponent } from './test-sign-out/test-sign-out.component';
import { EmojiPickerComponent } from './components/emoji-picker/emoji-picker.component';
import { CreateChannelComponent } from './components/shared/dialogs/create-channel/create-channel.component';
import { EmojisComponent } from './components/shared/emojis/emojis.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { VerificationSuccessComponent } from './components/auth/verification-success/verification-success.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileMenuComponent } from './components/dashboard/profile-menu/profile-menu.component';
import { ThreadComponent } from './components/chat/thread/thread.component';
import { MainChatComponent } from "./components/chat/main-chat/main-chat.component";
import { NewMessageComponent } from "./components/chat/main-chat/new-message/new-message.component";
import { DirectMessageComponent } from './components/chat/main-chat/direct-message/direct-message.component';
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
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileMenuComponent },
  { path: 'thread', component: ThreadComponent },
  { path: 'main-chat', component: MainChatComponent },
  { path: 'new-message', component: NewMessageComponent },
  { path: 'direct-message', component: DirectMessageComponent },
];
