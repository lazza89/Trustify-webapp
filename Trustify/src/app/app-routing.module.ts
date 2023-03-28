import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AreaPersonaleComponent } from './area-personale/area-personale.component';

import { HomePageComponent } from './home-page/home-page.component';

import { PagamentoComponent } from './pagamento/pagamento.component';

const routes: Routes = [
  { path: '/pagamento', component: PagamentoComponent },
  { path: '/areapersonale', component: AreaPersonaleComponent },
  { path: '/', component: HomePageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
