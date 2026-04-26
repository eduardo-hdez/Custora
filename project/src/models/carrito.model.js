import supabase from '../config/supabase.js';
import {randomUUID} from 'crypto';

export default class Carrito {
  constructor(id_carrito, id_concesionaria) {
    this.id_carrito = id_carrito;
    this.id_concesionaria = id_concesionaria;
  }

  static async createNewCart(id_concesionaria) {
    const id_carrito = randomUUID();
    const carrito = new Carrito(id_carrito, id_concesionaria);

    const {data, error} = await supabase
        .from('carrito')
        .insert({id_carrito: carrito.id_carrito, id_concesionaria: carrito.id_concesionaria})
        .select('id_carrito, id_concesionaria')
        .single();

    return {data, error};
  }

  static async getCartById(id_concesionaria) {
    const {data, error} = await supabase
        .from('carrito')
        .select(`
          id_carrito,
          id_concesionaria,
          productos_seleccionados (
            id_producto,
            cantidad,
            producto (
              id_producto,
              nombre_producto,
              precio_producto,
              peso_unidad,
              foto_producto,
              unidad_venta_producto
            )
          )
        `)
        .eq('id_concesionaria', id_concesionaria)
        .order('id_producto', {referencedTable: 'productos_seleccionados', ascending: true})
        .maybeSingle();
    return {data, error};
  }

  static async clearCart(id_carrito) {
    const {data, error} = await supabase
        .from('productos_seleccionados')
        .delete()
        .eq('id_carrito', id_carrito);
    return {data, error};
  }

  static async removeFromCart(id_carrito, id_producto) {
    const {data, error} = await supabase
        .from('productos_seleccionados')
        .delete()
        .eq('id_carrito', id_carrito)
        .eq('id_producto', id_producto);
    return {data, error};
  }

  static async insertToCart(id_carrito, id_producto, cantidad) {
    const {data, error} = await supabase
        .from('productos_seleccionados')
        .insert({id_carrito, id_producto, cantidad});
    return {data, error};
  }

  static async updateCartItemQuantity(id_carrito, id_producto, cantidad) {
    if (cantidad <= 0) {
      return Carrito.removeFromCart(id_carrito, id_producto);
    }
    const {data, error} = await supabase
        .from('productos_seleccionados')
        .update({cantidad})
        .eq('id_carrito', id_carrito)
        .eq('id_producto', id_producto);
    return {data, error};
  }
}
