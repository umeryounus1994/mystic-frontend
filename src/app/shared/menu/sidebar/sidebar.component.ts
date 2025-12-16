import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language/language.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  login_role = "admin";
  routeURL = "dashboard/admin";
  sidebarOpen = false;
  collapseStates: { [key: string]: boolean } = {};
  
  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    public auth: AuthService,
    public translate: TranslateService,
    public languageService: LanguageService
  ) {
    
    if(this.auth.isSubAdmin){this.login_role = "subadmin"}
    
    // Force sidebar closed on initialization
    this.sidebarOpen = false;
  }

  ngOnInit() {
    // Ensure sidebar is closed
    this.sidebarOpen = false;
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.routeURL = this.router.url;
      // Auto-close sidebar on route change for mobile
      if (this.isMobile) {
        this.closeSidebar();
      }
    });
    
    this.setupToggleListener();
  }

  get isMobile(): boolean {
    return window.innerWidth < 1200;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    console.log('Sidebar toggled to:', this.sidebarOpen);
  }

  closeSidebar() {
    this.sidebarOpen = false;
    console.log('Sidebar closed, state:', this.sidebarOpen);
  }

  toggleCollapse(key: string) {
    this.collapseStates[key] = !this.collapseStates[key];
  }

  private setupToggleListener() {
    // Listen for toggle events from header
    document.addEventListener('toggleSidebar', () => {
      this.toggleSidebar();
    });
  }
}
