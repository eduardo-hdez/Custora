import supabase from '../config/supabase.js';

export default class Usuario {
  static async findUserWithRole(id) {
    const {data, error} = await supabase
        .rpc('get_usuario_con_rol', {p_id_usuario: String(id).trim()})
        .maybeSingle();

    if (error || !data) {
      return {data: null, error};
    }
    return {data, error: null};
  }

  static verifyPassword(attemptedPassword, storedPassword) {
    if (attemptedPassword == null || storedPassword == null) {
      return false;
    }
    return String(attemptedPassword) === String(storedPassword);
  }
}
