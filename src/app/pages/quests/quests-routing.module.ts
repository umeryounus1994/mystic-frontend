import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListQuestComponent } from './list-quest/list-quest.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { CreateQuestComponent } from './create-quest/create-quest.component';
import { EditQuestComponent } from './edit-quest/edit-quest.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-quest',
      component: ListQuestComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'create-quest',
      component: CreateQuestComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'edit-quest',
      component: EditQuestComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestsRoutingModule { }
