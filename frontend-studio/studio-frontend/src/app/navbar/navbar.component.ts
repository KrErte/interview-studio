import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StreakService } from '../services/streak.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(
    public auth: AuthService,
    private router: Router,
    public streak: StreakService
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
