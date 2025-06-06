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
  id: number;
  fecha: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  total: number;
  clienteNick: string;
  clienteId: number;
  productoIds: number[];
}

export interface DetallePedido {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoNombre: string;
}

export interface ComentarioProducto {
  id?: number;
  comentario: string;
  calificacion: number;
  usuarioId: number;
  usuarioNick: string;
  productoId: number;
}

export interface ComentarioBlog {
  id?: number;
  comentario: string;
  calificacion: number;
  usuarioNick: string;
  publicacionId: number;
  fecha?: string;
}

export interface Comentario {
  id?: number;
  comentario: string;
  calificacion: number;
  usuarioId: number;
  fecha?: Date;
  autor?: {
    id: number;
    nick: string;
    nombre: string;
  };
}

export interface Publicacion {
  id?: number;
  titulo: string;
  contenido: string;
  fecha: string;
  categoria: string;
  autor: {
    id: number;
    nombre: string;
    nick: string;
  };
}

export interface PublicacionRequest {
  titulo: string;
  contenido: string;
  categoria: string;
  autorId: number;
}

export interface StockUpdate {
  productoId: number;
  cantidadVendida: number;
}

export interface StockUpdateRequest {
  productos: StockUpdate[];
}


