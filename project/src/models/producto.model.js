import supabase from '../config/supabase.js';

export default class Producto {
  constructor(id, nombre, descripcion, precio, foto, pesoUnidad, unidadVenta, idCampania) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.foto = foto;
    this.pesoUnidad = pesoUnidad;
    this.unidadVenta = unidadVenta;
    this.idCampania = idCampania;
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
          id_campaña: this.idCampania,
        }]);
  }

  static async fetchAll() {
    const {data, error} = await supabase
        .rpc('get_catalogo_productos_habilitados');
    return {data, error};
  }

  static async findById(id) {
    const {data, error} = await supabase
        .rpc('get_producto_habilitado', {id_producto: id})
        .single();
    return {data, error};
  }

  static async deshabilitar(ids) {
    const {data, error} = await supabase
        .from('producto')
        .update({habilitado: false})
        .in('id_producto', ids);
    return {data, error};
  }
}
