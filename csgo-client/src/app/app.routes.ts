import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { ServersModule } from './pages/servers';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'home',  component: HomeComponent },
  { path: 'servers',  component: ServersModule },
  { path: '**',    component: NoContentComponent },
];
