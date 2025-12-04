<p align="center">
  <img src="public/logo-header.webp" alt="Órbita Logo" width="200" />
</p>

<h1 align="center">Órbita</h1>
<h3 align="center">Análisis Inteligente del Boletín Oficial Argentino</h3>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://web.dev/progressive-web-apps/"><img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" /></a>
</p>

<p align="center">
  <a href="https://orbita.aoneken.com">🌐 Demo en Vivo</a> •
  <a href="#características">✨ Características</a> •
  <a href="#instalación">🚀 Instalación</a> •
  <a href="#contacto">📬 Contacto</a>
</p>

---

## 📖 Sobre el Proyecto

**Órbita** es una aplicación web progresiva (PWA) diseñada para transformar la manera en que los ciudadanos, periodistas y analistas acceden a la información del Boletín Oficial de la República Argentina.

> 🎯 **Misión:** Democratizar el acceso a la información pública mediante tecnología moderna y diseño centrado en el usuario.

### ¿Por qué Órbita?

- 📰 El Boletín Oficial publica cientos de avisos diarios
- 🔍 Encontrar información relevante es tedioso y consume tiempo
- 📱 Las plataformas oficiales no están optimizadas para móviles
- 🤖 **Órbita resuelve esto** con filtros inteligentes, categorización automática y una experiencia mobile-first

---

## ✨ Características

| Feature                      | Descripción                                                           |
| ---------------------------- | --------------------------------------------------------------------- |
| 🌓 **Modo Oscuro/Claro**     | Tema adaptativo con detección automática del sistema                  |
| 📱 **PWA Instalable**        | Instala la app en tu dispositivo como una aplicación nativa           |
| 🔗 **Compartir en RRSS**     | Comparte avisos directamente en Twitter, WhatsApp, Telegram           |
| 📅 **Navegación por Fecha**  | Explora el boletín de cualquier día con un selector intuitivo         |
| 🏷️ **Filtros por Categoría** | Filtra por tipo de aviso (Decretos, Resoluciones, Licitaciones, etc.) |
| 📊 **Dashboard Analítico**   | Visualiza estadísticas y tendencias del boletín                       |
| ⚡ **Ultra Rápido**          | Code splitting, lazy loading y optimización de bundles                |
| ♿ **Accesible**             | Cumple estándares WCAG para accesibilidad web                         |

---

## 🛠️ Stack Tecnológico

```
Frontend:      React 19 + TypeScript + Vite
Estilos:       Tailwind CSS + shadcn/ui
Estado:        TanStack Query (React Query)
Routing:       React Router v7
Backend:       Supabase (PostgreSQL + Auth + Storage)
PWA:           Vite PWA Plugin + Workbox
Animaciones:   Framer Motion
Testing:       Vitest + Testing Library
Deploy:        Cloudflare Pages
```

---

## 🚀 Instalación

### Requisitos Previos

- Node.js 20+
- npm 10+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Aoneken/orbita.git
cd orbita

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts Disponibles

| Comando             | Descripción                      |
| ------------------- | -------------------------------- |
| `npm run dev`       | Servidor de desarrollo con HMR   |
| `npm run build`     | Build de producción optimizado   |
| `npm run preview`   | Preview del build de producción  |
| `npm run lint`      | Ejecutar ESLint                  |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm test`          | Ejecutar tests                   |

---

## ☁️ Despliegue

### Cloudflare Pages (Recomendado)

1. Conecta tu repositorio de GitHub a Cloudflare Pages
2. Configura el build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Añade las variables de entorno de Supabase
4. ¡Deploy automático en cada push a `main`!

---

## 📁 Estructura del Proyecto

```
orbita/
├── public/              # Assets estáticos (logos, PWA icons)
├── src/
│   ├── components/
│   │   ├── shared/      # Componentes reutilizables
│   │   ├── ui/          # Sistema de diseño (shadcn/ui)
│   │   └── views/       # Páginas/Vistas principales
│   ├── contexts/        # Contextos React (Theme, Fecha)
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades y configuración
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Funciones helper
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una idea para mejorar Órbita:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📬 Contacto

<p align="center">
  <strong>Desarrollado con ❤️ por <a href="https://aoneken.com">Aoneken</a></strong>
</p>

<p align="center">
  <a href="mailto:comercial@aoneken.com">📧 comercial@aoneken.com</a> •
  <a href="https://t.me/orbita_aok">💬 Telegram: @orbita_aok</a>
</p>

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - Copyright (c) 2024 Aoneken
```

---

<p align="center">
  <sub>⭐ Si te resulta útil, considera dar una estrella al repositorio</sub>
</p>
