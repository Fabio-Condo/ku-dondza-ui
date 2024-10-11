import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorHandlerService } from './core/error-handler.service';
import { FeedsRoutingModule } from './feeds/feeds-routing.module';
import { FeedsModule } from './feeds/feeds.module';
import { ExamesRoutingModule } from './exames/exames-routing.module';
import { ExamesModule } from './exames/exames.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { InstitutionsRoutingModule } from './institutions/institutions-routing.module';
import { CoursesRoutingModule } from './courses/courses-routing.module';
import { CoursesModule } from './courses/courses.module';
import { CoreRoutingModule } from './core/core-routing.module';
import { UsersModule } from './users/users.module';
import { UsersRoutingModule } from './users/users-routing.module';
import { AuthenticationService } from './users/authentication.service';
import { AuthenticationGuard } from './security/Guard/authentication.guard';
import { UserService } from './users/user.service';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { AuthInterceptor } from './security/interceptor/auth.interceptor';
import { GroupModule } from './group/group.module';
import { GroupsRoutingModule } from './group/groups-routing.module';
import { OnlineCoursesModule } from './online-courses/online-courses.module';
import { OnlineCoursesRoutingModule } from './online-courses/online-courses-routing.module';
import { HomeModule } from './home/home.module';
import { HomeRoutingModule } from './home/home-routing.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    
    FeedsRoutingModule,
    ExamesRoutingModule,
    InstitutionsRoutingModule,
    CoursesRoutingModule,
    CoursesRoutingModule,
    OnlineCoursesRoutingModule,
    UsersRoutingModule,
    GroupsRoutingModule,
    HomeRoutingModule,
  
    FeedsModule,
    ExamesModule,
    InstitutionsModule,
    CoursesModule,
    OnlineCoursesModule,
    UsersModule,
    GroupModule,
    HomeModule,

    CoreRoutingModule,
    AppRoutingModule,

    CoreModule,
  ],
  providers: [
    ConfirmationService,
    MessageService,
    ErrorHandlerService,
    AuthenticationGuard,
    AuthenticationService,
    UserService,
    JwtHelperService,
    DatePipe,
    //{ provide: LOCALE_ID, useValue: 'fr' },
    //{ provide: LOCALE_ID, useValue: 'pt-MZ' },
    //{ provide: LOCALE_ID, useValue: 'pt-US' },
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
