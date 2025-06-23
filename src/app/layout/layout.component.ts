import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  urlText: string = '';
  showNavbar = true;

  // Define navigation links dynamically
  navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Portfolio Tracker', path: '/portfoliotracker' },
    { label: 'Investments Timeline Tracker', path: '/investmentstimeline' },
    { label: 'Allocation Splitter', path: '/allocationsplitter' },
    { label: 'Financial Calculators', path: '/financialcalculators' }
  ];

  externalLinks = [
    {
      label: 'GitHub',
      url: 'https://github.com/sandeep9622/stocksdemo',
      icon: 'github'
    },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/sandeep-singh-8819841a1/',
      icon: 'linkedin'
    }
  ];

  constructor(private router: Router, private authService: AuthService) {
    // Listen to navigation events to update the active URL and navbar visibility
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.urlText = event.url;
        this.showNavbar = (event.url !== '/login' && event.url !== '/login/' && event.url !== '/' && event.url !== '');
      });
  }

  ngOnInit(): void {
  }

  onLogout(): void {
    this.authService.logout();
  }
}
