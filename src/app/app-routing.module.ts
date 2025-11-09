import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';
import { ContentComponent } from './layouts/content/content.component';
import { content } from './shared/routes/content.routes';
import { FullWidthComponent } from './layouts/full-width/full-width.component';
import { full } from './shared/routes/full.routes';
import { AuthGuard } from './guards/auth/auth.guard';
import { PaypalSuccessComponent } from './components/paypal-success/paypal-success.component';
import { PaypalCancelComponent } from './components/paypal-cancel/paypal-cancel.component';

const appRoutes: Routes = [
  {
    path: '',
    component: ContentComponent,
    children: content,
    canActivate: [AuthGuard]
  }
  ,
  {
    path: '',
    component: FullWidthComponent,
    children: full
  },
  {
    path: 'payment/paypal/success',
    component: PaypalSuccessComponent
  },
  {
    path: 'payment/paypal/cancel',
    component: PaypalCancelComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: NoPreloading, anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled', useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
