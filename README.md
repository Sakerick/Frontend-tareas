# frontend_tareas

Frontend de gestión de tareas desarrollado con Vue 3, Vite y Vuetify.

## 🧱 Stack

- Framework: Vue 3
- Bundler: Vite
- UI Library: Vuetify
- Estado: Pinia
- Routing: Vue Router
- Lenguaje: TypeScript
- Package manager: npm

## 🚀 Descripción del proyecto

Esta aplicación es un frontend para un sistema de administración de tareas con autenticación y roles.

- Pantalla de login con credenciales y opción de inicio de sesión con Google.
- Panel de tareas donde el usuario puede crear, editar, completar y eliminar tareas.
- Filtrado de tareas por título y etiquetas.
- Creación de nuevas etiquetas desde el formulario de tareas.
- Sección de administrador con estadísticas y listado de usuarios.

## 📍 Rutas principales

- `/login` — Página de login.
- `/tareas` — Tablero principal de tareas, protegido por autenticación.
- `/admin` — Panel de administración, acceso restringido a usuarios con rol admin.
- `/` — Redirige automáticamente a `/tareas`.

## 🧩 Estructura clave

- `src/main.ts` — Punto de entrada de la aplicación.
- `src/App.vue` — Componente raíz.
- `src/router/index.ts` — Configuración de rutas y guardias de navegación.
- `src/stores/auth.ts` — Store de autenticación con login, logout y verificación de sesión.
- `src/composables/useApi.ts` — Helper para llamadas a la API con CSRF y credenciales.
- `src/components/LoginDesign.vue` — Formulario de inicio de sesión.
- `src/components/Tareas.vue` — Vista principal de tareas con creación, edición y filtrado.
- `src/components/AdminPanel.vue` — Panel administrativo con métricas y listado de usuarios.

## ⚙️ Configuración del entorno

La app consume una API en `https://localhost:3100`.

Variables importantes:

- `VITE_API_KEY` — API key usada en el login.

## 💡 Usuario de prueba

- Email: `root@local`
- Contraseña: `rootpass`

## 💿 Instalación

Instala dependencias con npm:

```bash
npm install
```

## 🔧 Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

## 🧪 Scripts disponibles

- `npm run dev` — Inicia el servidor de desarrollo.
- `npm run build` — Genera el build de producción.
- `npm run preview` — Previsualiza el build.
- `npm run build-only` — Construye el proyecto sin ejecutar preview.
- `npm run type-check` — Comprueba tipos TypeScript.
- `npm run mcp` — Ejecuta comandos de Vuetify MCP.
- `npm run mcp:revert` — Revierte cambios de Vuetify MCP.

## 📝 Notas

- El frontend gestiona la sesión con cookies y tokens CSRF.
- Si la sesión expira, redirige al usuario a `/login`.
- El panel de administración requiere que el usuario tenga `isAdmin`.
