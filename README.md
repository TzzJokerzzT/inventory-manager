# 📦 Inventory Manager — Frontend

**Sistema de gestión de inventarios** con control de stock, movimientos, compras, reportes y control de acceso basado en roles.

---

## 🧱 Arquitectura

Este proyecto sigue **Clean Architecture** con principios **SOLID** aplicados a React/Next.js.

```
src/
├── application/          # Casos de uso (lógica de negocio agnóstica del framework)
│   ├── use-cases/
│   └── ports/            # Interfaces (repositorios, servicios)
├── domain/               # Entidades, value objects, reglas de negocio puras
│   ├── entities/
│   ├── value-objects/
│   └── repositories/     # Contratos (interfaces)
├── infrastructure/       # Implementaciones concretas (API clients, storage, auth)
│   ├── api/
│   ├── auth/
│   ├── storage/
│   └── repositories/     # Implementaciones de los contratos del dominio
├── presentation/         # Componentes React, hooks, stores, páginas
│   ├── components/       # Componentes reutilizables (dumb / presentacionales)
│   ├── containers/       # Componentes conectados (smart / lógica)
│   ├── hooks/            # Hooks personalizados
│   ├── stores/           # Zustand stores (estado local)
│   └── pages/            # Páginas Next.js (App Router)
└── shared/               # Utilidades, constantes, tipos compartidos
    ├── types/
    ├── constants/
    └── utils/
```

- **Domain**: No depende de nada externo. Define _qué_ hace el sistema.
- **Application**: Orquesta los casos de uso usando puertos (interfaces).
- **Infrastructure**: Implementa los puertos con tecnologías concretas (Axios, Better Auth, TanStack Query).
- **Presentation**: UI pura — React + HeroUI + Tailwind.

---

## 🛠️ Stack Técnico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Runtime** | [Bun](https://bun.sh) | latest |
| **Framework** | [Next.js](https://nextjs.org) (App Router) | 16.2 |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org) (strict) | 5.x |
| **UI Library** | [HeroUI](https://heroui.com) v3 | 3.2 |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com) | 4.x |
| **State (servidor)** | [TanStack Query](https://tanstack.com/query) | 5.x |
| **State (cliente)** | [Zustand](https://zustand.docs.pmnd.rs) | 5.x |
| **HTTP Client** | [Axios](https://axios-http.com) | 1.x |
| **Validación** | [Valibot](https://valibot.dev) | 1.x |
| **Autenticación** | [Better Auth](https://better-auth.com) | 1.x |
| **Animaciones** | [Motion](https://motion.dev) (Framer Motion) | 12.x |
| **Gráficos** | [Chart.js](https://www.chartjs.org) + react-chartjs-2 | 4.x / 5.x |
| **PDF** | [PDFsLick React](https://pdfslick.dev) | 4.x |
| **Linter** | [Biome](https://biomejs.dev) | 2.2 |
| **Formatter** | Biome | 2.2 |
| **React Compiler** | babel-plugin-react-compiler | 1.0 |

---

## 🚀 Features

### 📋 Gestión de Productos
- CRUD completo (nombre, referencias, categorías, descripción)
- Subida y gestión de imágenes por producto
- Búsqueda textual y filtros rápidos
- Importación / exportación CSV y Excel

### 📊 Control de Stock
- Stock actual, mínimo y máximo por producto
- Alertas visuales cuando el stock alcanza niveles críticos
- Notificaciones in-app de stock bajo

### 🔄 Movimientos de Inventario
- **Entradas**: compras, devoluciones, ajustes positivos
- **Salidas**: ventas, mermas, ajustes negativos
- Historial auditable con fecha, usuario y motivo
- Filtrado por tipo, rango de fechas, producto y usuario

### 🛒 Compras y Proveedores
- Catálogo de proveedores (contacto, condiciones comerciales)
- Órdenes de compra con seguimiento de estado (pendiente → recibida → cancelada)
- Recepción de mercancía contra orden de compra

### 📈 Reportes y Analítica
- Dashboard con métricas clave
- Valor total del inventario
- Productos más y menos rotados
- Reportes de mermas y ajustes
- Gráficos interactivos

### 👥 Usuarios y Permisos (RBAC)
- **Admin**: acceso total (CRUD productos, movimientos, reportes, gestión de usuarios)
- **Operador**: registrar movimientos, gestionar stock, ver reportes
- **Solo lectura**: consultar inventario, ver reportes, sin permisos de escritura
- Rutas protegidas según rol

---

## 🏁 Getting Started

### Requisitos

- [Bun](https://bun.sh) ≥ 1.x

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd referral-creator

# Instalar dependencias
bun install

# Copiar variables de entorno
cp .env.example .env.local
```

### Desarrollo

```bash
bun dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

### Scripts disponibles

| Comando | Descripción |
|---------|------------|
| `bun dev` | Servidor de desarrollo con hot reload |
| `bun run build` | Build de producción |
| `bun start` | Iniciar servidor en producción |
| `bun run lint` | Linting con Biome |
| `bun run format` | Formateo de código con Biome |

---

## 🔐 Variables de Entorno

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Auth (Better Auth)
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-here

# Base de datos de auth (si Better Auth se conecta directamente)
DATABASE_URL=postgresql://user:password@localhost:5432/inventory
```

---

## 📐 Convenciones del Proyecto

| Aspecto | Regla |
|---------|-------|
| **Componentes** | PascalCase (`ProductCard.tsx`) |
| **Archivos** | kebab-case (`use-product-filter.ts`) |
| **Path alias** | `@/` → raíz del proyecto |
| **Estado del servidor** | TanStack Query (caché, revalidación) |
| **Estado local** | Zustand (UI state, filtros, modales) |
| **Fetching** | Axios con interceptores para auth |
| **Validación** | Schemas con Valibot, inferencia de tipos |
| **Estilos** | Tailwind CSS utility-first + HeroUI |
| **Tipado** | TypeScript estricto (`strict: true`) |
# inventory-manager
