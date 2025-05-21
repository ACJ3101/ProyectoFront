

export interface Usuario {
  id?: number;
  nombre: string;
  apellidos: string;
  nick: string;
  email: string;
  contraseña: string;
  direccion: string;
  fechaRegistro: string;
  rol: Rol;
}

export interface Rol {
  id: number;
  nombre?: string;
}


export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  categoria: string;
  usuario?: Usuario;
}

export interface Pedido {
  id?: number;
  fecha: string;
  estado: string;
  usuario: Usuario;
  detalles: DetallePedido[];
}

export interface DetallePedido {
  id?: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
}

export interface ComentarioProducto {
  id?: number;
  texto: string;
  fecha: string;
  usuario: Usuario;
  producto: Producto;
}

export interface PublicacionBlog {
  id?: number;
  titulo: string;
  contenido: string;
  fechaPublicacion: string;
  autor: Usuario;
}


