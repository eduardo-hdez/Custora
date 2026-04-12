import supabase from '../config/supabase.js';

export default class Reserva {
  static async generarFolio() {
    const { data } = await supabase
      .from('reserva')
      .select('folio')
      .order('folio', { ascending: false })
      .limit(1)
      .maybeSingle();

    const ultimo = data?.folio ? parseInt(data.folio.replace('F-', '')) : 1000;
    return `F-${ultimo + 1}`;
  }

  static async crear(folio, id_concesionaria, id_sucursal, id_campana) {
    const fecha_reserva = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('reserva')
      .insert({ folio, fecha_reserva, estado_reserva: true, id_concesionaria, id_sucursal, id_campana })
      .select()
      .single();
    return { data, error };
  }

  static async insertarProductos(folio, productos) {
    const rows = productos.map((ps) => ({
      folio,
      id_producto: ps.producto.id_producto,
      unidades_reservadas: ps.cantidad,
    }));
    const { data, error } = await supabase.from('productos_reservados').insert(rows);
    return { data, error };
  }

  static async fetchAll() {
    const { data, error } = await supabase
      .rpc('get_reservas_campania');
    return { data, error };
  }
}
