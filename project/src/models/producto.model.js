import supabase from '../config/supabase.js';

export default class Producto {
    constructor(id, nombre, descripcion, precio, foto, pesoUnidad, unidadVenta, idCampana) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.foto = foto;
        this.pesoUnidad = pesoUnidad;
        this.unidadVenta = unidadVenta;
        this.idCampana = idCampana;
    }

    save() {
        return supabase
            .from('producto')
            .insert([{
                id_producto: this.id,
                nombre_producto: this.nombre,
                descripcion_producto: this.descripcion,
                precio_producto: this.precio,
                foto_producto: this.foto,
                peso_unidad: this.pesoUnidad,
                unidad_venta_producto: this.unidadVenta,
                id_campana: this.idCampana,
            }]);
    }

    static async insertarFila(fila) {
        const { data, error } = await supabase
            .from('producto')
            .insert([
                {
                    id_producto: fila.id_producto,
                    nombre_producto: fila.nombre_producto,
                    descripcion_producto: fila.descripcion_producto,
                    precio_producto: fila.precio_producto,
                    peso_unidad: fila.peso_unidad,
                    unidad_venta_producto: fila.unidad_venta_producto,
                    id_campana: fila.id_campana,
                },
            ]);
        return { data, error }
    }

    static async fetchAllGestion() {
        const { data, error } = await supabase
            .rpc('get_productos_campania')
        return { data, error }
    }

    static async fetchAll() {
        const { data, error } = await supabase
            .rpc('get_catalogo_productos_habilitados');
        return { data, error };
    }

    static async findById(id) {
        const { data, error } = await supabase
            .rpc('get_producto_habilitado', { id_producto: id })
            .single();
        return { data, error };
    }

    static async deshabilitar(ids) {
        const { data, error } = await supabase
            .from('producto')
            .update({ habilitado: false })
            .in('id_producto', ids);
        return { data, error };
    }

    static async rehabilitar(ids) {
        const { data, error } = await supabase
            .from('producto')
            .update({ habilitado: true })
            .in('id_producto', ids);
        return { data, error };
    }
}
