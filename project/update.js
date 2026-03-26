import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/views/empleado/gestion-productos.ejs');
let content = fs.readFileSync(filePath, 'utf-8');

const regexTable = /(<tbody class="divide-y divide-gray-200 text-sm text-gray-800">)[\s\S]*?(<\/tbody>)/;

const newTable = `$1
              <% if (errorCatalogo) { %>
                <tr>
                  <td colspan="6" class="p-4 text-center text-red-600">
                    <%= errorCatalogo %>
                  </td>
                </tr>
              <% } else if (!productos || productos.length === 0) { %>
                <tr>
                  <td colspan="6" class="p-4 text-center text-gray-600">
                    No hay productos disponibles por el momento.
                  </td>
                </tr>
              <% } else { %>
                <% productos.forEach((producto) => { %>
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4 text-center text-gray-500 font-medium"><%= producto.id_producto || 'N/A' %></td>
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <img src="<%= producto.foto_producto || 'https://placehold.co/40x40/ffffff/cccccc?text=P' %>" alt="<%= producto.nombre_producto || 'Producto' %>" class="max-w-full max-h-full mix-blend-multiply p-1">
                        </div>
                        <div>
                          <p class="font-medium text-gray-900 line-clamp-1"><%= producto.nombre_producto || producto.nombre || 'Producto sin nombre' %></p>
                          <p class="text-xs text-gray-500">ID: <%= producto.id_producto || 'N/A' %></p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        General
                      </span>
                    </td>
                    <td class="p-4 text-gray-500"><%= producto.unidad_venta_producto || 'N/A' %></td>
                    <td class="p-4 text-right font-medium text-gray-900">$<%= Number(producto.precio_producto ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) %></td>
                    <td class="p-4">
                      <div class="flex items-center justify-center gap-2">
                        <button class="text-[#007185] hover:text-[#005d6e] hover:bg-teal-50 p-1.5 rounded-full transition-colors" title="Editar producto">
                          <span class="material-icons text-[20px]">edit</span>
                        </button>
                        <button class="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Eliminar producto">
                          <span class="material-icons text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                <% }) %>
              <% } %>
            $2`;

content = content.replace(regexTable, newTable);

const regexPaginacion = /Mostrando <span class="font-medium">\d+<\/span> a <span class="font-medium">\d+<\/span> de <span class="font-medium">\d+<\/span> resultados/;
const newPaginacion = `Mostrando <span class="font-medium">1</span> a <span class="font-medium"><%= productos ? productos.length : 0 %></span> de <span class="font-medium"><%= productos ? productos.length : 0 %></span> resultados`;

if (content.match(regexPaginacion)) {
    content = content.replace(regexPaginacion, newPaginacion);
} else {
    console.log("Pagination regex not found");
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Template updated successfully');
