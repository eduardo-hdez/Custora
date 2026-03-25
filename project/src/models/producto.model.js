import supabase from '../config/supabase.js'

module.exports = class Product {
    constructor(id, nombre, descripcion, precio, foto, pesoUnidad, unidadVenta) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.foto = foto;
        this.pesoUnidad = pesoUnidad;
        this.unidadVenta = unidadVenta;
    }

    static async fetchAll() {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
        return { data, error }
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id_producto', id)
            .single()
        return { data, error }
    }
}
