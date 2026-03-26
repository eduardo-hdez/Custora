import supabase from '../config/supabase.js';

export default class Concesionaria {
  static async findByUsuario(id) {
    const {data, error} = await supabase
        .rpc('get_concesionarias_usuario', {p_id_usuario: id});

    return {data, error};
  }
}
