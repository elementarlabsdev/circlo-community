import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(c => c.Overview)
      },
      {
        path: 'stripe',
        loadComponent: () => import('./stripe/stripe').then(c => c.Stripe)
      },
      {
        path: 'paid-account',
        loadComponent: () => import('./paid-account/paid-account').then(c => c.PaidAccount)
      },
      {
        path: 'credits',
        loadComponent: () => import('./credits/credits').then(c => c.AdminCreditsComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./transactions/transactions').then(c => c.Transactions)
      }
    ]
  }
];
