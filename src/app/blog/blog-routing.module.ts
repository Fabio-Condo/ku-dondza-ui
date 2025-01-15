import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { ListBlogComponent } from './list-blog/list-blog.component';
import { ViewBlogComponent } from './view-blog/view-blog.component';
import { CreateBlogComponent } from './create-blog/create-blog.component';

const routes: Routes = [
  { 
    path: 'blog', 
    component: ListBlogComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'blogs/new', 
    component: CreateBlogComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'blog/:id', 
    component: ViewBlogComponent,
    canActivate: [AuthenticationGuard], 
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
export class BlogRoutingModule { }
