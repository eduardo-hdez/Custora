import supabase from '../config/supabase.js';

export default class Carrito {
    constructor(id_carrito, id_concesionaria) {
        this.id_carrito = id_carrito;
        this.id_concesionaria = id_concesionaria;
    }

    static async getCartById(id_concesionaria) {
        const { data, error } = await supabase
            .from('carrito')
            .select(`
                id_carrito,
                id_concesionaria,
                productos_seleccionados (
                    cantidad,
                    productos (
                        id_producto,
                        nombre,
                        precio,
                        foto,
                        unidad_venta
                    )
                )
            `)
            .eq('id_concesionaria', id_concesionaria)
            .single()
        return { data, error }
    }

    static async insertToCart(id_carrito, id_producto, cantidad) {
        const { data, error } = await supabase
            .from('productos_seleccionados')
            .insert({ id_carrito, id_producto, cantidad })
        return { data, error }
    }

    static async removeProduct(id_carrito, id_producto) {
        const { data, error } = await supabase
            .from('productos_seleccionados')
            .delete()
            .eq('id_carrito', id_carrito)
            .eq('id_producto', id_producto)
        return { data, error }
    }

    static async updateQuantity(id_carrito, id_producto, cantidad) {
        const { data, error } = await supabase
            .from('productos_seleccionados')
            .update({ cantidad })
            .eq('id_carrito', id_carrito)
            .eq('id_producto', id_producto)
        return { data, error }
    }
}
