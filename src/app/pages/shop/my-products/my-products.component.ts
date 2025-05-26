import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpService } from '../../../core/services/http/http.service';
import { StorageService } from '../../../core/services/storageService/storage.service';
import { Producto, Categoria } from '../../../core/models/interfaces';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.css']
})
export class MyProductsComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  productoForm: FormGroup;
  modalVisible = false;
  productoSeleccionado: Producto | null = null;

  constructor(
    private httpService: HttpService,
    private storageService: StorageService,
    private fb: FormBuilder
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      imagenUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      categoria: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();

  }

  cargarCategorias(): void {
    this.httpService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  obtenerNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : 'Categoría no encontrada';
  }

  cargarProductos(): void {
    const usuario = this.storageService.obtenerUsuario();
    const token = this.storageService.obtenerToken();

    if (usuario && usuario.id && token) {
      this.httpService.getProductosPorUsuario(usuario.id, token).subscribe({
        next: (productos) => {
          this.productos = productos;
          this.productos.forEach(producto => {
          });
        },
        error: (error) => {
          console.error('Error al cargar los productos:', error);
        }
      });
    }
  }

  abrirModal(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagenUrl: producto.imagenUrl,
      categoria: producto.categoriaId // Este es el ID de la categoría
    });
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.productoSeleccionado = null;
    this.productoForm.reset();
  }

  guardarCambios(): void {
    if (this.productoForm.valid && this.productoSeleccionado) {
      const token = this.storageService.obtenerToken();
      if (!token) {
        console.error('No hay token disponible');
        return;
      }

      const productoActualizado = {
        ...this.productoSeleccionado,
        ...this.productoForm.value
      };

      this.httpService.actualizarProducto(this.productoSeleccionado.id!, productoActualizado, token).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al actualizar el producto:', error);
        }
      });
    }
  }

  get nombreInvalido(): boolean {
    return this.productoForm.get('nombre')?.invalid &&
           this.productoForm.get('nombre')?.touched || false;
  }

  get descripcionInvalida(): boolean {
    return this.productoForm.get('descripcion')?.invalid &&
           this.productoForm.get('descripcion')?.touched || false;
  }

  get precioInvalido(): boolean {
    return this.productoForm.get('precio')?.invalid &&
           this.productoForm.get('precio')?.touched || false;
  }

  get stockInvalido(): boolean {
    return this.productoForm.get('stock')?.invalid &&
           this.productoForm.get('stock')?.touched || false;
  }

  get imagenUrlInvalida(): boolean {
    return this.productoForm.get('imagenUrl')?.invalid &&
           this.productoForm.get('imagenUrl')?.touched || false;
  }

  get categoriaInvalida(): boolean {
    return this.productoForm.get('categoria')?.invalid &&
           this.productoForm.get('categoria')?.touched || false;
  }
}
