import { Routes } from "@angular/router";


export const SHOP_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./homeProduct/homeProduct.component').then(m => m.HomeProductComponent),
      },
      {
        path: 'producto/:id',
        loadComponent: () =>
          import('./product/product.component').then(m => m.ProductComponent),
      },
      {
        path: 'mis-productos',
        loadComponent: () =>
          import('./my-products/my-products.component').then(m => m.MyProductsComponent),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
