import Usuario from '../models/usuario.model.js';
import Concesionaria from '../models/concesionaria.model.js';
import {ROL_CLIENTE, ROL_EMPLEADO} from '../middleware/auth.middleware.js';

const LOGIN_ERROR = 'Correo o contraseña incorrectos.';
const ROLE_ERROR = 'Tu usuario no tiene un rol asignado. Contacta al administrador.';

export function getLogin(request, response) {
  if (request.session.idUsuario && request.session.idRol) {
    const dest = request.session.idRol === ROL_CLIENTE ? '/cliente' : '/empleado';
    return response.redirect(dest);
  }
  response.render('login', {title: 'Iniciar sesión', error: null, correo: ''});
}

export async function postLogin(request, response) {
  const correo = String(request.body.correo ?? '').trim();
  const password = request.body.password;

  try {
    const {data: user, error: userError} = await Usuario.findUserWithRole(correo);
    if (userError) {
      throw userError;
    }

    if (!user || !Usuario.verifyPassword(password, user.contraseña)) {
      return response.render('login', {title: 'Iniciar sesión', error: LOGIN_ERROR, correo});
    }

    if (user.id_rol !== ROL_CLIENTE && user.id_rol !== ROL_EMPLEADO) {
      return response.render('login', {title: 'Iniciar sesión', error: ROLE_ERROR, correo});
    }

    request.session.idUsuario = user.id_usuario;
    request.session.idRol = user.id_rol;
    request.session.correo = correo;

    if (user.id_rol === ROL_CLIENTE) {
      const {data: poseer} = await Concesionaria.findByUsuario(user.id_usuario);
      const concesionarias = (poseer ?? []).map((p) => p.id_concesionaria);
      request.session.concesionarias = concesionarias;
      request.session.idConcesionaria = concesionarias[0] ?? null;
      return response.redirect('/cliente');
    }

    return response.redirect('/empleado');
  } catch (error) {
    return response.status(500).render('login', {
      title: 'Iniciar sesión',
      error: 'Ocurrio un error interno al iniciar sesion. Intenta nuevamente.',
      correo,
    });
  }
}

export function postLogout(request, response) {
  request.session.destroy(() => {
    response.clearCookie('session');
    response.redirect('/login');
  });
}
