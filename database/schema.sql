-- ==========================================================
-- TAIKO — Script completo de creación de base de datos
-- Ejecutar en Railway PostgreSQL (Query tab o psql)
-- ==========================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================================
-- TIPOS ENUM
-- ==========================================================

CREATE TYPE public.emisor_mensaje AS ENUM ('cliente', 'chatbot');
CREATE TYPE public.rol_usuario AS ENUM ('admin', 'cliente');

-- ==========================================================
-- TABLAS DE CATÁLOGO
-- ==========================================================

CREATE TABLE public.carrocerias (
    id   SERIAL PRIMARY KEY,
    nombre character varying(50) NOT NULL UNIQUE
);

CREATE TABLE public.transmisiones (
    id   SERIAL PRIMARY KEY,
    nombre character varying(50) NOT NULL UNIQUE
);

CREATE TABLE public.combustibles (
    id   SERIAL PRIMARY KEY,
    nombre character varying(50) NOT NULL UNIQUE
);

CREATE TABLE public.etiquetas_ambientales (
    id   SERIAL PRIMARY KEY,
    nombre character varying(10) NOT NULL UNIQUE,
    descripcion text
);

CREATE TABLE public.equipamiento (
    id   SERIAL PRIMARY KEY,
    nombre character varying(100) NOT NULL UNIQUE,
    categoria character varying(50)
);

-- ==========================================================
-- TABLA USUARIOS
-- ==========================================================

CREATE TABLE public.usuarios (
    id            uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    nombre        character varying(100) NOT NULL,
    email         character varying(100) NOT NULL UNIQUE,
    password_hash character varying(255) NOT NULL,
    telefono      character varying(20),
    rol           public.rol_usuario NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo        boolean DEFAULT true NOT NULL
);

-- ==========================================================
-- TABLA VEHÍCULOS
-- ==========================================================

CREATE TABLE public.vehiculos (
    id           uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    marca        character varying(50)  NOT NULL,
    modelo       character varying(100) NOT NULL,
    version      character varying(150),
    vin          character varying(17) UNIQUE,
    anio         integer NOT NULL,
    kilometros   integer DEFAULT 0,
    precio       numeric(12,2) NOT NULL,
    color        character varying(50),
    descripcion  text,
    transmision_id integer REFERENCES public.transmisiones(id),
    etiqueta_id    integer REFERENCES public.etiquetas_ambientales(id),
    carroceria_id  integer REFERENCES public.carrocerias(id),
    disponible   boolean DEFAULT true,
    fecha_alta   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABLAS RELACIONES VEHÍCULOS
-- ==========================================================

CREATE TABLE public.vehiculo_combustibles (
    vehiculo_id    uuid    NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    combustible_id integer NOT NULL REFERENCES public.combustibles(id) ON DELETE CASCADE,
    PRIMARY KEY (vehiculo_id, combustible_id)
);

CREATE TABLE public.vehiculo_equipamiento (
    vehiculo_id    uuid    NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    equipamiento_id integer NOT NULL REFERENCES public.equipamiento(id) ON DELETE CASCADE,
    PRIMARY KEY (vehiculo_id, equipamiento_id)
);

CREATE TABLE public.imagenes (
    id          uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    vehiculo_id uuid REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    url         text NOT NULL,
    es_principal boolean DEFAULT false
);

-- ==========================================================
-- TABLA EMBEDDINGS (búsqueda semántica)
-- ==========================================================

CREATE TABLE public.vehicle_embeddings (
    id              uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    vehiculo_id     uuid UNIQUE REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    embedding       public.vector(1536),
    modelo_ia       character varying(50) DEFAULT 'text-embedding-3-small',
    texto_procesado text,
    fecha_generado  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABLAS CHAT
-- ==========================================================

CREATE TABLE public.conversaciones (
    id                  uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    usuario_id          uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    vehiculo_contexto_id uuid REFERENCES public.vehiculos(id) ON DELETE SET NULL,
    canal               character varying(50) DEFAULT 'web',
    fecha_inicio        timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.mensajes (
    id               uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    conversacion_id  uuid REFERENCES public.conversaciones(id) ON DELETE CASCADE,
    emisor           public.emisor_mensaje NOT NULL,
    contenido        text NOT NULL,
    fecha_envio      timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- DATOS DE CATÁLOGO (necesarios para que la app funcione)
-- ==========================================================

INSERT INTO carrocerias (id, nombre) VALUES (1, 'SUV');
INSERT INTO carrocerias (id, nombre) VALUES (2, 'Berlina');
INSERT INTO carrocerias (id, nombre) VALUES (3, 'Compacto');
INSERT INTO carrocerias (id, nombre) VALUES (4, 'Deportivo');

INSERT INTO transmisiones (id, nombre) VALUES (1, 'Manual');
INSERT INTO transmisiones (id, nombre) VALUES (2, 'Automático');

INSERT INTO combustibles (id, nombre) VALUES (1, 'Gasolina');
INSERT INTO combustibles (id, nombre) VALUES (2, 'Diésel');
INSERT INTO combustibles (id, nombre) VALUES (3, 'Híbrido');
INSERT INTO combustibles (id, nombre) VALUES (4, 'Eléctrico');
INSERT INTO combustibles (id, nombre) VALUES (9, 'GLP');

INSERT INTO etiquetas_ambientales (id, nombre, descripcion) VALUES (1, 'C',    'Etiqueta Verde');
INSERT INTO etiquetas_ambientales (id, nombre, descripcion) VALUES (2, 'ECO',  'Híbridos');
INSERT INTO etiquetas_ambientales (id, nombre, descripcion) VALUES (3, 'CERO', 'Eléctricos');

INSERT INTO equipamiento (id, nombre, categoria) VALUES (1,  'Aire Acondicionado',      'Confort');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (2,  'Navegador GPS',            'Tecnología');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (3,  'Cámara Trasera',           'Seguridad');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (4,  'Sensores de Aparcamiento', 'Seguridad');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (5,  'Faros LED',                'Iluminación');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (6,  'Asientos Calefactados',    'Confort');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (7,  'Techo Panorámico',         'Exterior');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (8,  'Apple CarPlay',            'Tecnología');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (9,  'Android Auto',             'Tecnología');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (10, 'Control de Crucero',       'Seguridad');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (11, 'Bluetooth',                'Tecnología');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (12, 'Llantas de Aleación',      'Exterior');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (13, 'Volante Multifunción',     'Confort');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (14, 'Arranque sin Llave',       'Confort');
INSERT INTO equipamiento (id, nombre, categoria) VALUES (15, 'Tapicería de Cuero',       'Interior');

-- Ajustar secuencias para que los próximos IDs no colisionen
SELECT setval('carrocerias_id_seq', (SELECT MAX(id) FROM carrocerias));
SELECT setval('transmisiones_id_seq', (SELECT MAX(id) FROM transmisiones));
SELECT setval('combustibles_id_seq', (SELECT MAX(id) FROM combustibles));
SELECT setval('etiquetas_ambientales_id_seq', (SELECT MAX(id) FROM etiquetas_ambientales));
SELECT setval('equipamiento_id_seq', (SELECT MAX(id) FROM equipamiento));
