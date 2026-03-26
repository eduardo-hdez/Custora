import Usuario from '../models/usuario.model.js';
import { ROL_CLIENTE, ROL_EMPLEADO } from '../middleware/auth.middleware.js';

const LOGIN_ERROR = 'Correo o contraseña incorrectos.';
const ROLE_ERROR = 'Tu usuario no tiene un rol asignado. Contacta al administrador.';

export function getLogin(request, response) {
  if (request.session.idUsuario && request.session.idRol) {
    const dest = request.session.idRol === ROL_CLIENTE ? '/cliente' : '/empleado';
    return response.redirect(dest);
  }
  response.render('login', { title: 'Iniciar sesión', error: null, correo: '' });
}

export async function postLogin(request, response) {
  const correo = String(request.body.correo).trim();
  const password = request.body.password;

  const { data: user } = await Usuario.findUserWithRole(correo);

  if (!user || !Usuario.verifyPassword(password, user.contraseña)) {
    return response.render('login', { title: 'Iniciar sesión', error: LOGIN_ERROR, correo });
  }

  if (user.id_rol !== ROL_CLIENTE && user.id_rol !== ROL_EMPLEADO) {
    return response.render('login', { title: 'Iniciar sesión', error: ROLE_ERROR, correo });
  }

  request.session.idUsuario = user.id_usuario;
  request.session.idRol = user.id_rol;

  response.redirect(user.id_rol === ROL_CLIENTE ? '/cliente' : '/empleado');
}

export function postLogout(request, response) {
  request.session.destroy(() => response.redirect('/login'));
}
