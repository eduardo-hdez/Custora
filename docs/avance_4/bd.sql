CREATE TABLE public.asignar (
  id_usuario text NOT NULL,
  id_rol text NOT NULL,
  CONSTRAINT asignar_pkey PRIMARY KEY (id_usuario, id_rol),
  CONSTRAINT asignar_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario),
  CONSTRAINT asignar_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol)
);
CREATE TABLE public.calificar (
  id_producto bigint NOT NULL,
  id_concesionaria bigint NOT NULL,
  puntuacion double precision NOT NULL,
  comentario text,
  fecha_calificacion date NOT NULL,
  CONSTRAINT calificar_pkey PRIMARY KEY (id_producto, id_concesionaria),
  CONSTRAINT calificar_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto),
  CONSTRAINT calificar_id_concesionaria_fkey FOREIGN KEY (id_concesionaria) REFERENCES public.concesionaria(id_concesionaria)
);
CREATE TABLE public.campana (
  id_campana bigint NOT NULL,
  nombre_campana text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  tiempo_cancelacion bigint NOT NULL,
  banner text,
  CONSTRAINT campana_pkey PRIMARY KEY (id_campana)
);
CREATE TABLE public.carrito (
  id_carrito text NOT NULL,
  id_concesionaria bigint NOT NULL,
  CONSTRAINT carrito_pkey PRIMARY KEY (id_carrito),
  CONSTRAINT carrito_id_concesionaria_fkey FOREIGN KEY (id_concesionaria) REFERENCES public.concesionaria(id_concesionaria)
);
CREATE TABLE public.concesionaria (
  id_concesionaria bigint NOT NULL,
  nombre_concesionaria text NOT NULL,
  CONSTRAINT concesionaria_pkey PRIMARY KEY (id_concesionaria)
);
CREATE TABLE public.poseer (
  id_usuario text NOT NULL,
  id_concesionaria bigint NOT NULL,
  CONSTRAINT poseer_pkey PRIMARY KEY (id_usuario, id_concesionaria),
  CONSTRAINT poseer_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario),
  CONSTRAINT poseer_id_concesionaria_fkey FOREIGN KEY (id_concesionaria) REFERENCES public.concesionaria(id_concesionaria)
);
CREATE TABLE public.privilegios (
  id_privilegio text NOT NULL,
  nombre_privilegio text NOT NULL,
  descripcion_privilegio text NOT NULL,
  CONSTRAINT privilegios_pkey PRIMARY KEY (id_privilegio)
);
CREATE TABLE public.producto (
  id_producto bigint NOT NULL,
  nombre_producto text NOT NULL,
  descripcion_producto text NOT NULL,
  precio_producto double precision NOT NULL,
  foto_producto text NOT NULL,
  peso_unidad double precision NOT NULL,
  unidad_venta_producto text NOT NULL,
  id_campana bigint NOT NULL,
  habilitado boolean NOT NULL DEFAULT true,
  CONSTRAINT producto_pkey PRIMARY KEY (id_producto),
  CONSTRAINT producto_id_campaña_fkey FOREIGN KEY (id_campana) REFERENCES public.campana(id_campana)
);
CREATE TABLE public.productos_reservados (
  folio text NOT NULL,
  id_producto bigint NOT NULL,
  unidades_reservadas bigint NOT NULL,
  CONSTRAINT productos_reservados_pkey PRIMARY KEY (folio, id_producto),
  CONSTRAINT productos_reservados_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto),
  CONSTRAINT productos_reservados_folio_fkey FOREIGN KEY (folio) REFERENCES public.reserva(folio)
);
CREATE TABLE public.productos_seleccionados (
  id_carrito text NOT NULL,
  id_producto bigint NOT NULL,
  cantidad integer NOT NULL,
  CONSTRAINT productos_seleccionados_pkey PRIMARY KEY (id_carrito, id_producto),
  CONSTRAINT productos_seleccionados_id_carrito_fkey FOREIGN KEY (id_carrito) REFERENCES public.carrito(id_carrito),
  CONSTRAINT productos_seleccionados_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.rbac (
  id_privilegio text NOT NULL,
  id_rol text NOT NULL,
  CONSTRAINT rbac_pkey PRIMARY KEY (id_privilegio, id_rol),
  CONSTRAINT rbac_id_privilegio_fkey FOREIGN KEY (id_privilegio) REFERENCES public.privilegios(id_privilegio),
  CONSTRAINT rbac_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol)
);
CREATE TABLE public.reserva (
  folio text NOT NULL,
  fecha_reserva date NOT NULL,
  estado_reserva boolean NOT NULL DEFAULT true,
  id_concesionaria bigint NOT NULL,
  id_sucursal bigint NOT NULL,
  fecha_hora_reserva timestamp with time zone NOT NULL DEFAULT now(),
  id_campana bigint NOT NULL,
  fecha_cancelacion timestamp with time zone,
  CONSTRAINT reserva_pkey PRIMARY KEY (folio),
  CONSTRAINT reserva_id_concesionaria_fkey FOREIGN KEY (id_concesionaria) REFERENCES public.concesionaria(id_concesionaria),
  CONSTRAINT reserva_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES public.sucursal(id_sucursal),
  CONSTRAINT reserva_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campana(id_campana)
);
CREATE TABLE public.rol (
  id_rol text NOT NULL,
  nombre_rol text NOT NULL,
  CONSTRAINT rol_pkey PRIMARY KEY (id_rol)
);
CREATE TABLE public.sucursal (
  id_sucursal bigint NOT NULL,
  nombre_sucursal text NOT NULL,
  ubicacion text NOT NULL,
  id_concesionaria bigint NOT NULL,
  CONSTRAINT sucursal_pkey PRIMARY KEY (id_sucursal),
  CONSTRAINT sucursal_id_concesionaria_fkey FOREIGN KEY (id_concesionaria) REFERENCES public.concesionaria(id_concesionaria)
);
CREATE TABLE public.usuario (
  id_usuario text NOT NULL,
  contraseña text NOT NULL,
  CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario)
);

-- =============================================================
-- Función: crear_reserva_completa
-- Descripción: Inserta la reserva y sus productos de forma
--   atómica. Si algo falla, Postgres revierte todo.
-- =============================================================
-- IMPORTANTE: Ejecutar este bloque en el SQL Editor de Supabase
--   para reemplazar la función anterior.
-- =============================================================

-- Paso 1: eliminar la versión anterior (firma distinta)
DROP FUNCTION IF EXISTS crear_reserva_completa(TEXT,INT,INT,INT,TEXT,TEXT,JSONB);

-- Paso 2: crear la nueva versión con arreglos
CREATE OR REPLACE FUNCTION crear_reserva_completa(
  p_folio              TEXT,
  p_id_concesionaria   INT,
  p_id_sucursal        INT,
  p_id_campana         INT,
  p_fecha_reserva      TEXT,
  p_fecha_hora_reserva TEXT,
  p_ids_producto       INT[],
  p_unidades           INT[]
)
RETURNS VOID
LANGUAGE sql
AS $$
  INSERT INTO reserva (
    folio, fecha_reserva, fecha_hora_reserva,
    estado_reserva, id_concesionaria, id_sucursal, id_campana
  ) VALUES (
    p_folio,
    p_fecha_reserva::DATE,
    p_fecha_hora_reserva::TIMESTAMPTZ,
    TRUE,
    p_id_concesionaria,
    p_id_sucursal,
    p_id_campana
  );

  INSERT INTO productos_reservados (folio, id_producto, unidades_reservadas)
  SELECT p_folio, id_prod, unidades
  FROM unnest(p_ids_producto, p_unidades) AS t(id_prod, unidades);
$$;