import { Routes } from "@angular/router";


export const PAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages.component').then(m => m.PagesComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'auth',
        loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),
        loadChildren : () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
      },
      {
        path: 'blog',
        loadComponent: () => import('./blog/blog.component').then(m => m.BlogComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'shop',
        loadComponent: () => import('./shop/shop.component').then(m => m.ShopComponent),
        loadChildren: () => import('./shop/shop.routes').then(m => m.SHOP_ROUTES)
      },
      {
        path: 'cart',
        loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ]
  },
]
