export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Usuario {
  id?: number;
  nombre: string;
  apellidos: string;
  nick: string;
  email: string;
  contraseña?: string;
  direccion?: string;
  rol?: any;
}

export const ROLES = {
  CLIENTE: 1,
  VENDEDOR: 2,
  ADMIN: 3
} as const;

export interface Rol {
  id: number;
  nombre: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  fechaCreacion: string;
  publicado: boolean;
  categoriaId: number;
  usuarioId: number;
  usuarioNick: string;
  calidad: number | null;
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

export interface Comentario {
  id?: number;
  comentario: string;
  calificacion: number;
  usuarioId: number;
  usuarioNick?: string;
  productoId: number;
}

export interface Publicacion {
  id?: number;
  titulo: string;
  contenido: string;
  categoria: string;
  autorId: number;
  autorNick?: string;
  fecha?: Date;
  likes?: number;
  comentarios?: number;
}

export interface PublicacionRequest {
  titulo: string;
  contenido: string;
  categoria: string;
  autorId: number;
}


