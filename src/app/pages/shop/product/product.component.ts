import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../core/services/http/http.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Producto } from '../../../core/models/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProductComponent implements OnInit {

  producto!: Producto;

  constructor(private route: ActivatedRoute, private http: HttpService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.getProductoPorId(+id).subscribe({
        next: res => {
          this.producto = res;
          console.log(this.producto);
        },
        error: () => console.error('No se pudo cargar el producto')
      });
    }
  }
}
