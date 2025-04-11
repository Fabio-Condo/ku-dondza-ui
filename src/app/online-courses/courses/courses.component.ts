import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  isUserLoggedIn: boolean = false;
  loggedUser: User = new User();
  isPopoutVisible = false;
  isMenuActive = false;

  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
    this.isPopoutVisible = false;
  }

  goToProfile() {
    this.router.navigate(['/user/profile', this.loggedUser.userId]);
  }

  @ViewChild('slider', { static: false }) slider: ElementRef | undefined;


  testimonials = [
    { text: '"Essa plataforma mudou minha forma de estudar!"', author: 'Anna Silva', role: 'Estudante' },
    { text: '"Os recursos são incríveis e o suporte é ótimo."', author: 'João Pedro', role: 'Professor' },
    { text: '"Recomendo para todos que querem aprender mais!"', author: 'Larissa Gomes', role: 'Aluna' },
    // Adicione mais depoimentos aqui
  ];

  scroll(direction: string): void {
    const sliderElement = this.slider?.nativeElement;
    const scrollAmount = 320; // Igual ou maior que a largura do card

    if (direction === 'next') {
      sliderElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else if (direction === 'prev') {
      sliderElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

}
