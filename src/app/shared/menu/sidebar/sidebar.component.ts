import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { filter } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  login_role = "admin";
  routeURL = "dashboard/admin";
  constructor(private router: Router,
    private route: ActivatedRoute, public auth: AuthService) {
      if(this.auth.isAdmin){this.login_role = "admin"}
      if(this.auth.isSubAdmin){this.login_role = "subadmin"}

  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.routeURL = this.router.url;
    });
  }
}
