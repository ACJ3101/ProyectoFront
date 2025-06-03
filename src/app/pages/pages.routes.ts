import { Routes } from "@angular/router";
import { adminGuard } from "../core/guards/admin.guard";
import { profileGuard } from "../core/guards/profile.guard";
import { PaymentSuccessComponent } from "./payment-success/payment-success.component";
import { PaymentFailedComponent } from "./payment-failed/payment-failed.component";
import { CheckoutComponent } from "./checkout/checkout.component";


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
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [profileGuard]
      },
      {
        path: 'my-orders',
        loadComponent: () => import('./my-orders/my-orders.component').then(m => m.MyOrdersComponent),
        canActivate: [profileGuard],
        title: 'Mis Pedidos'
      },
      {
        path: 'admin',
        loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'payment-success',
        component: PaymentSuccessComponent
      },
      {
        path: 'payment-failed',
        component: PaymentFailedComponent
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        title: 'Checkout'
      },
      {
        path: 'mis-publicaciones',
        loadComponent: () => import('./mis-publicaciones/mis-publicaciones.component').then(m => m.MisPublicacionesComponent),
        canActivate: [profileGuard],
        title: 'Mis Publicaciones'
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ]
  },
]
