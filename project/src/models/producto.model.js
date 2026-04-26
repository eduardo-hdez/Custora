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

    static async insertCalificacion({
        id_producto,
        id_concesionaria,
        puntuacion,
        comentario,
        fecha_calificacion,
    }) {
        const { data, error } = await supabase
            .from('calificar')
            .insert([{
                id_producto,
                id_concesionaria,
                puntuacion,
                comentario,
                fecha_calificacion,
            }]);

        return { data, error };
    }

    static async existeCalificacionPorProductoYConcesionaria(idProducto, idConcesionaria) {
        const { data, error } = await supabase
            .from('calificar')
            .select('id_producto')
            .eq('id_producto', idProducto)
            .eq('id_concesionaria', idConcesionaria)
            .limit(1);

        return {
            existe: Array.isArray(data) && data.length > 0,
            error,
        };
    }

    static async getResenasByProductoId(idProducto) {
        const { data, error } = await supabase
            .from('calificar')
            .select('id_producto,id_concesionaria,puntuacion,comentario,fecha_calificacion,concesionaria(nombre_concesionaria)')
            .eq('id_producto', idProducto)
            .order('fecha_calificacion', { ascending: false });

        return { data, error };
    }

    static async getResumenCalificacionesByProductoIds(idsProducto) {
        const ids = Array.isArray(idsProducto) ? idsProducto.filter(Boolean) : [];
        if (ids.length === 0) {
            return { data: [], error: null };
        }

        const { data, error } = await supabase
            .from('calificar')
            .select('id_producto,puntuacion')
            .in('id_producto', ids);

        if (error || !Array.isArray(data)) {
            return { data: [], error };
        }

        const acumulado = new Map();
        data.forEach((row) => {
            const id = row.id_producto;
            const puntuacion = Number(row.puntuacion) || 0;
            if (!id || puntuacion <= 0) return;
            const previo = acumulado.get(id) || { suma: 0, totalResenas: 0 };
            previo.suma += puntuacion;
            previo.totalResenas += 1;
            acumulado.set(id, previo);
        });

        const resumen = Array.from(acumulado.entries()).map(([id_producto, valor]) => ({
            id_producto,
            total_resenas: valor.totalResenas,
            promedio_puntuacion: valor.totalResenas > 0 ? (valor.suma / valor.totalResenas) : 0,
        }));

        return { data: resumen, error: null };
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
    static async obtenerProductoPorId(id) {
  const { data, error } = await supabase
    .rpc('obtener_producto_por_id', { p_id_producto: id })
    .single();
  if (error) throw error;
  return {
    id: data.id_producto,
    nombre: data.nombre_producto,
    descripcion: data.descripcion_producto,
    precio: data.precio_producto,
    foto: data.foto_producto,
    pesoUnidad: data.peso_unidad,
    unidadVenta: data.unidad_venta_producto,
    idCampana: data.id_campana,
    habilitado: data.habilitado,
  };
}

static async actualizarProducto({ idProducto, nombreProducto, descripcion, precio, pesoUnidad, unidadVenta, idCampana, habilitado, foto }) {
  const { error } = await supabase.rpc('actualizar_producto', {
    p_id_producto:           idProducto,
    p_nombre_producto:       nombreProducto,
    p_descripcion_producto:  descripcion,
    p_precio_producto:       parseFloat(precio),
    p_peso_unidad:           parseFloat(pesoUnidad),
    p_unidad_venta_producto: unidadVenta,
    p_id_campana:            parseInt(idCampana),
    p_habilitado:            habilitado,
    p_foto_producto:         foto ?? null,
  });
  if (error) throw error;
}

}


