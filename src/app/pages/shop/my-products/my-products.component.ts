import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpService } from '../../../core/services/http/http.service';
import { StorageService } from '../../../core/services/storageService/storage.service';
import { ToastService } from '../../../core/services/toast/toast.service';
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
  productoCreacionForm: FormGroup;
  modalVisible = false;
  modalEliminacionVisible = false;
  modalCreacionVisible = false;
  productoSeleccionado: Producto | null = null;
  productoAEliminar: Producto | null = null;

  constructor(
    private httpService: HttpService,
    private storageService: StorageService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      imagenUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      categoriaId: ['', Validators.required],
      publicado: [true]
    });

    this.productoCreacionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      imagenUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      categoriaId: ['', Validators.required],
      publicado: [true]
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

    if (usuario && usuario.id) {
      this.httpService.getProductosPorUsuario(usuario.id).subscribe({
        next: (productos) => {
          this.productos = productos;
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
      categoriaId: producto.categoriaId,
      publicado: producto.publicado
    });
    console.log(this.productoForm.value);
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.productoSeleccionado = null;
    this.productoForm.reset();
  }

  guardarCambios(): void {
    if (this.productoForm.valid && this.productoSeleccionado) {
      const productoActualizado = {
        nombre: this.productoForm.value.nombre,
        descripcion: this.productoForm.value.descripcion,
        precio: this.productoForm.value.precio,
        stock: this.productoForm.value.stock,
        imagenUrl: this.productoForm.value.imagenUrl,
        publicado: this.productoForm.value.publicado,
        categoriaId: this.productoForm.value.categoriaId
      };

      this.httpService.actualizarProducto(this.productoSeleccionado.id!, productoActualizado).subscribe({
        next: () => {
          this.toastService.show('Producto actualizado correctamente', 'success');
          this.cerrarModal();
          this.cargarProductos();
        },
        error: (error) => {
          if (error.status === 200) {
            this.toastService.show('Producto actualizado correctamente', 'success');
            this.cerrarModal();
            this.cargarProductos();
          } else {
            this.toastService.show('Error al actualizar el producto', 'error');
            console.error('Error al actualizar el producto:', error);
          }
        }
      });
    } else {
      this.toastService.show('Por favor, completa todos los campos correctamente', 'warning');
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
    return this.productoForm.get('categoriaId')?.invalid &&
           this.productoForm.get('categoriaId')?.touched || false;
  }

  eliminarProducto(producto: Producto): void {
    this.productoAEliminar = producto;
    this.modalEliminacionVisible = true;
  }

  cerrarModalEliminacion(): void {
    this.modalEliminacionVisible = false;
    this.productoAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.productoAEliminar) {
      this.httpService.eliminarProducto(this.productoAEliminar.id!).subscribe({
        next: () => {
          this.toastService.show('Producto eliminado correctamente', 'success');
          this.cerrarModalEliminacion();
          this.cargarProductos();
        },
        error: (error) => {
          this.toastService.show('Error al eliminar el producto', 'error');
          console.error('Error al eliminar el producto:', error);
        }
      });
    }
  }

  abrirModalCreacion(): void {
    this.modalCreacionVisible = true;
  }

  cerrarModalCreacion(): void {
    this.modalCreacionVisible = false;
    this.productoCreacionForm.reset({
      publicado: true
    });
  }

  crearProducto(): void {
    if (this.productoCreacionForm.valid) {
      const usuario = this.storageService.obtenerUsuario();
      if (!usuario) {
        this.toastService.show('No hay usuario autenticado', 'error');
        return;
      }

      const nuevoProducto = {
        ...this.productoCreacionForm.value,
        usuarioId: usuario.id
      };

      this.httpService.crearProducto(nuevoProducto).subscribe({
        next: () => {
          this.toastService.show('Producto creado correctamente', 'success');
          this.cerrarModalCreacion();
          this.cargarProductos();
        },
        error: (error) => {
          this.toastService.show('Error al crear el producto', 'error');
          console.error('Error al crear el producto:', error);
        }
      });
    } else {
      this.toastService.show('Por favor, completa todos los campos correctamente', 'warning');
    }
  }

  get nombreInvalidoCreacion(): boolean {
    return this.productoCreacionForm.get('nombre')?.invalid &&
           this.productoCreacionForm.get('nombre')?.touched || false;
  }

  get descripcionInvalidaCreacion(): boolean {
    return this.productoCreacionForm.get('descripcion')?.invalid &&
           this.productoCreacionForm.get('descripcion')?.touched || false;
  }

  get precioInvalidoCreacion(): boolean {
    return this.productoCreacionForm.get('precio')?.invalid &&
           this.productoCreacionForm.get('precio')?.touched || false;
  }

  get stockInvalidoCreacion(): boolean {
    return this.productoCreacionForm.get('stock')?.invalid &&
           this.productoCreacionForm.get('stock')?.touched || false;
  }

  get imagenUrlInvalidaCreacion(): boolean {
    return this.productoCreacionForm.get('imagenUrl')?.invalid &&
           this.productoCreacionForm.get('imagenUrl')?.touched || false;
  }

  get categoriaInvalidaCreacion(): boolean {
    return this.productoCreacionForm.get('categoriaId')?.invalid &&
           this.productoCreacionForm.get('categoriaId')?.touched || false;
  }
}
