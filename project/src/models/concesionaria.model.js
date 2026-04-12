import supabase from '../config/supabase.js';

export default class Concesionaria {
  static async findByUsuario(id) {
    const {data, error} = await supabase
        .rpc('get_concesionarias_usuario', {p_id_usuario: id});

    return {data, error};
  }

  static async getSucursales(id_concesionaria) {
    const {data, error} = await supabase
        .from('sucursal')
        .select('id_sucursal, nombre_sucursal, ubicacion')
        .eq('id_concesionaria', id_concesionaria)
        .order('nombre_sucursal');

    return {data, error};
  }
}
