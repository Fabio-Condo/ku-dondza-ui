import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { ArticlesComponent } from './articles/articles.component';
import { CreateArticleComponent } from './create-article/create-article.component';
import { ViewArticleComponent } from './view-article/view-article.component';

const routes: Routes = [
  { 
    path: 'articles', 
    component: ArticlesComponent,
    //canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'articles/create/:id', 
    component: CreateArticleComponent,
    //canActivate: [AuthenticationGuard], 
    runGuardsAndResolvers: 'always', // Força a recriação do componente
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true-
    //} 
  },
  { 
    path: 'articles/:id', 
    component: ViewArticleComponent,
    //canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }