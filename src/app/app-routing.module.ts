import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllocationSplitterComponent } from './allocation-splitter/allocation-splitter.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { PortfolioTrackerComponent } from './portfolio-tracker/portfolio-tracker.component';
import { FinancialCalculatorsComponent } from './financial-calculators/financial-calculators.component';
import { InvestmentsTimelineTrackerComponent } from './investments-timeline-tracker/investments-timeline-tracker.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'allocationsplitter', component: AllocationSplitterComponent },
  { path: 'portfoliotracker', component: PortfolioTrackerComponent },
  { path: 'financialcalculators', component: FinancialCalculatorsComponent },
  { path: 'investmentstimeline', component: InvestmentsTimelineTrackerComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Updated this line
  { path: '**', redirectTo: 'login' }  // Updated this line
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
