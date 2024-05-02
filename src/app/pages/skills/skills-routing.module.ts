import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListSkillComponent } from './list-skill/list-skill.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { AddSkillComponent } from './add-skill/add-skill.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-skill',
      component: ListSkillComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'create-skill',
      component: AddSkillComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillsRoutingModule { }
