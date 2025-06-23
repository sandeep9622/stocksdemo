import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllocationSplitterComponent } from './allocation-splitter/allocation-splitter.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { PortfolioTrackerComponent } from './portfolio-tracker/portfolio-tracker.component';
import { FinancialCalculatorsComponent } from './financial-calculators/financial-calculators.component';
import { InvestmentsTimelineTrackerComponent } from './investments-timeline-tracker/investments-timeline-tracker.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'allocationsplitter', 
    component: AllocationSplitterComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'portfoliotracker', 
    component: PortfolioTrackerComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'financialcalculators', 
    component: FinancialCalculatorsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'investmentstimeline', 
    component: InvestmentsTimelineTrackerComponent,
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
