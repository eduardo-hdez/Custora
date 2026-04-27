import {Resend} from 'resend';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const resend = new Resend(process.env.RESEND_API_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_IMAGE_PATH = path.resolve(__dirname, '../../public/images/branding/ppg_logo.svg');
let fallbackImageDataUri = null;

async function getFallbackImageDataUri() {
  if (fallbackImageDataUri) return fallbackImageDataUri;

  try {
    const svg = await readFile(FALLBACK_IMAGE_PATH, 'utf8');
    const base64 = Buffer.from(svg).toString('base64');
    fallbackImageDataUri = `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    fallbackImageDataUri = 'https://placehold.co/120x120/ffffff/cccccc?text=PPG';
  }

  return fallbackImageDataUri;
}

export async function enviarConfirmacionReserva(_correo, detalleReserva) {
  const {
    idConcesionaria,
    folio,
    estadoPedido = 'Reserva Confirmada',
    fechaReserva = new Date(),
    sucursalDireccion = 'N/D',
    productos = [],
  } = detalleReserva || {};
  const fallbackImage = await getFallbackImageDataUri();
  const fecha = new Date(fechaReserva);
  const fechaTexto = Number.isNaN(fecha.getTime()) ? 'N/D' : fecha.toLocaleDateString('es-MX');
  const horaTexto = Number.isNaN(fecha.getTime()) ?
    'N/D' :
    fecha.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'});

  const filasProductos = productos.map((ps) => {
    const nombre = ps.producto?.nombre_producto ?? 'Producto';
    const precio = Number(ps.producto?.precio_producto ?? 0);
    const subtotal = precio * ps.cantidad;
    const imagen = ps.producto?.foto_producto || fallbackImage;
    const fmt = (n) => n.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    return `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <img src="${imagen}" alt="${nombre}" width="58" height="58" style="width: 58px; height: 58px; object-fit: contain; border-radius: 6px; border: 1px solid #e5e7eb; background: #ffffff;">
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nombre}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280; text-align: center;">${ps.cantidad}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: right;">$${fmt(precio)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: right; font-weight: 600;">$${fmt(subtotal)}</td>
      </tr>
    `;
  }).join('');

  const subtotalTotal = productos.reduce((acc, ps) => acc + Number(ps.producto?.precio_producto ?? 0) * ps.cantidad, 0);
  const iva = subtotalTotal * 0.16;
  const total = subtotalTotal + iva;
  const fmt = (n) => n.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2});

  const {error} = await resend.emails.send({
    from: 'Reservas <onboarding@resend.dev>',
    to: 'a01707225@tec.mx', // TODO: cambiar a `_correo` cuando se verifique un dominio
    subject: `Confirmación de reserva ${folio}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">

        <div style="background: #2B6398; padding: 32px 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px;">¡Reserva confirmada!</h1>
          <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Tu reserva ha sido registrada exitosamente.</p>
        </div>

        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">

          <div style="background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px 24px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 13px;">Folio de reserva</p>
            <p style="margin: 4px 0 0; font-size: 26px; font-weight: 700; color: #2B6398; letter-spacing: 1px;">${folio}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tbody>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Cuenta</td>
                <td style="padding: 10px 0; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${idConcesionaria ?? 'N/D'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Estado de pedido</td>
                <td style="padding: 10px 0; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${estadoPedido}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Fecha</td>
                <td style="padding: 10px 0; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${fechaTexto}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Hora</td>
                <td style="padding: 10px 0; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${horaTexto}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Dirección de sucursal</td>
                <td style="padding: 10px 0; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${sucursalDireccion}</td>
              </tr>
            </tbody>
          </table>

          <h2 style="font-size: 15px; color: #374151; margin: 0 0 12px;">Productos reservados</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 10px 8px; text-align: center; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Imagen</th>
                <th style="padding: 10px 8px; text-align: left; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Producto</th>
                <th style="padding: 10px 8px; text-align: center; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Cant.</th>
                <th style="padding: 10px 8px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Precio u.</th>
                <th style="padding: 10px 8px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${filasProductos}
            </tbody>
          </table>

          <div style="margin-top: 16px; padding-top: 12px; border-top: 2px solid #e5e7eb; text-align: right; font-size: 14px;">
            <p style="margin: 4px 0; color: #6b7280;">Subtotal: <span style="color: #111827;">$${fmt(subtotalTotal)}</span></p>
            <p style="margin: 4px 0; color: #6b7280;">IVA (16%): <span style="color: #111827;">$${fmt(iva)}</span></p>
            <p style="margin: 12px 0 0; font-size: 17px; font-weight: 700; color: #111827;">Total: $${fmt(total)}</p>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
            Guarda este folio para dar seguimiento a tu reserva.
          </p>
        </div>

      </div>
    `,
  });

  if (error) console.error('[email] enviarConfirmacionReserva error:', error);
}

export async function enviarCancelacionReserva(_correo, folio) {
  const fechaCancelacion = new Date().toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const {error} = await resend.emails.send({
    from: 'Reservas <onboarding@resend.dev>',
    to: 'a01707225@tec.mx', // TODO: usar correo real al verificar dominio
    subject: `Cancelación de reserva ${folio}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
        <div style="background: #b91c1c; padding: 32px 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px;">Reserva cancelada</h1>
          <p style="margin: 8px 0 0; color: #fecaca; font-size: 14px;">Tu solicitud de cancelación se procesó correctamente.</p>
        </div>

        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px 24px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 13px;">Folio de reserva</p>
            <p style="margin: 4px 0 0; font-size: 24px; font-weight: 700; color: #2B6398; letter-spacing: 1px;">${folio}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tbody>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Estado</td>
                <td style="padding: 10px 0; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Cancelada</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Fecha de cancelación</td>
                <td style="padding: 10px 0; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${fechaCancelacion}</td>
              </tr>
            </tbody>
          </table>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #374151; font-weight: 600;">¿Qué sigue?</p>
            <ul style="margin: 0; padding-left: 18px; color: #4b5563; font-size: 13px; line-height: 1.6;">
              <li>Tu reserva ya no está activa en el sistema.</li>
              <li>Si fue un error, puedes generar una nueva reserva desde el catálogo.</li>
              <li>Conserva el folio por si necesitas soporte.</li>
            </ul>
          </div>
        </div>
      </div>
    `,
  });

  if (error) console.error('[email] enviarCancelacionReserva error:', error);
}