import { Routes } from '@angular/router';

import { NoContentComponent } from '../../no-content';

import { ServersComponent } from './servers.component';

import { EmptyComponent } from './empty';
import { NewComponent } from './new';
import { EditComponent } from './edit';



import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: 'servers',
    component: ServersComponent,
    children: [
      { path: '',  component: EmptyComponent },
      { path: 'new',  component: NewComponent },
      { path: 'edit',  component: EditComponent },
      { path: '**',    component: NoContentComponent }
    ]
  }
];
