import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorHandlerService } from './core/error-handler.service';
import { CoreRoutingModule } from './core/core-routing.module';
import { UsersModule } from './users/users.module';
import { UsersRoutingModule } from './users/users-routing.module';
import { AuthenticationService } from './users/authentication.service';
import { AuthenticationGuard } from './security/Guard/authentication.guard';
import { UserService } from './users/user.service';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { AuthInterceptor } from './security/interceptor/auth.interceptor';
import { HomeModule } from './home/home.module';
import { HomeRoutingModule } from './home/home-routing.module';
import { QuizModule } from './quiz/quiz.module';
import { QuizRoutingModule } from './quiz/quiz-routing.module';
import { QuestionRoutingModule } from './questions/question-routing.module';
import { QuestionsModule } from './questions/questions.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SubjectsRoutingModule } from './subjects/subjects-routing.module';
import { TopicsModule } from './topics/topics.module';
import { TopicsRoutingModule } from './topics/topics-routing.module';
import { MainPanelRoutingModule } from './main-panel/main-panel-routing.module';
import { MainPanelModule } from './main-panel/main-panel.module';
import { PricesModule } from './prices/prices.module';
import { PricesRoutingModule } from './prices/prices-routing.module';
import { FaqRoutingModule } from './faq/faq-routing.module';
import { FaqModule } from './faq/faq.module';
import { PrivacyPolicyRoutingModule } from './privacy-policy/privacy-policy-routing.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { AboutUsModule } from './about-us/about-us.module';
import { AboutUsRoutingModule } from './about-us/about-us-routing.module';
import { ExamesModule } from './exames/exames.module';
import { ExamesRoutingModule } from './exames/exames-routing.module';
import { ProgressRoutingModule } from './progress/progress-routing.module';
import { ProgressModule } from './progress/progress.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentsRoutingModule } from './payments/payments-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ChallengesModule } from './challenges/challenges.module';
import { ChallengesRoutingModule } from './challenges/challenges-routing.module';
import { FlashCardsRoutingModule } from './flash-cards/flash-cards-routing.module';
import { FlashCardsModule } from './flash-cards/flash-cards.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,

    SubjectsRoutingModule,
    TopicsRoutingModule,
    UsersRoutingModule,
    HomeRoutingModule,
    QuizRoutingModule,
    QuestionRoutingModule,
    ExamesRoutingModule,
    MainPanelRoutingModule,
    PricesRoutingModule,
    FaqRoutingModule,
    PrivacyPolicyRoutingModule,
    AboutUsRoutingModule,
    ProgressRoutingModule,
    PaymentsRoutingModule,
    ChallengesRoutingModule,
    FlashCardsRoutingModule,

    SubjectsModule,
    TopicsModule,
    UsersModule,
    HomeModule,
    QuizModule,
    QuestionsModule,
    ExamesModule,
    MainPanelModule,
    PricesModule,
    FaqModule,
    PrivacyPolicyModule,
    AboutUsModule,
    ProgressModule,
    PaymentsModule,
    ChallengesModule,
    FlashCardsModule,

    CoreRoutingModule,
    AppRoutingModule,

    CoreModule,
     ServiceWorkerModule.register('ngsw-worker.js', {
       enabled: !isDevMode(),
       // Register the ServiceWorker as soon as the application is stable
       // or after 30 seconds (whichever comes first).
       registrationStrategy: 'registerWhenStable:30000'
     }),
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
