import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  urlText: string = ''; // Current URL

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

  constructor(router: Router) {
    // Listen to navigation events to update the active URL
    router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((res) => {
        if (res instanceof NavigationEnd) {
          this.urlText = res.url; // Update the current URL
        }
      });
  }
}
