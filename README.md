# Central Norte — Sistema de Gestión

Sistema de gestión empresarial para Central Norte. Incluye un sitio público institucional y un dashboard administrativo completo para la gestión de clientes, productos, presupuestos de merchandising, servicios de picking/logística y creación de slides para el home del sitio público.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | React 19 + Inertia.js 2.0 |
| Base de datos | MySQL + Eloquent ORM |
| PDF | barryvdh/laravel-dompdf |
| Excel | phpoffice/phpspreadsheet |
| Imágenes | intervention/image |
| Email | SMTP / Mailgun (symfony/mailgun-mailer) |
| Build | Vite + Laravel Vite Plugin |

---

## Arquitectura: dos stacks de frontend

El proyecto tiene **dos aplicaciones Inertia independientes** sobre el mismo backend Laravel, con distintos sistemas de diseño:

| Aspecto | Dashboard (admin) | Sitio Público |
|---|---|---|
| Blade root | `resources/views/dashboard.blade.php` | `resources/views/public.blade.php` |
| Entry point JS | `resources/js/dashboard.jsx` | `resources/js/public.jsx` |
| CSS | `resources/css/dashboard.css` | `resources/css/public.css` |
| Estilos | Tailwind CSS 4 | Bootstrap 5 + CSS Modules |
| Componentes UI | Radix UI / shadcn | Bootstrap grid |
| Iconos | Lucide React | react-icons (fa6, si, etc.) |
| Animaciones | — | AOS (Animate On Scroll) |
| Layout | `resources/js/layouts/dashboard/` | `resources/js/layouts/public/` |

> **Importante:** No mezclar Tailwind en el sitio público ni Bootstrap en el dashboard.

El middleware `HandleInertiaRequestsCustom` determina qué root view usar según el nombre de la ruta. Las vistas públicas de presupuestos (`/presupuesto/{token}`, `/presupuesto-picking/{token}`) usan el root de dashboard (Tailwind), no el del sitio público.

---

## Setup inicial

```bash
# 1. Clonar e instalar dependencias
composer install
npm install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Migrar y sembrar datos
php artisan migrate
php artisan db:seed

# 4. Iniciar desarrollo
composer run dev
```

`composer run dev` levanta en paralelo el servidor Laravel, la queue, el log monitor (Pail) y el servidor Vite.

---

## Comandos de desarrollo

### Backend
```bash
php artisan serve            # Servidor Laravel
php artisan migrate          # Correr migraciones
php artisan db:seed          # Sembrar datos
php artisan queue:work       # Procesar la queue manualmente (en dev, lo hace composer run dev)
php artisan schedule:run     # Ejecutar tareas programadas manualmente
php artisan tinker           # REPL interactivo
vendor/bin/pint              # Formatear PHP (PSR-12)
vendor/bin/pest              # Correr tests
```

### Frontend
```bash
npm run dev          # Dev server con HMR
npm run build        # Build de producción
npm run build:ssr    # Build con SSR
npm run lint         # ESLint
npm run format       # Prettier (auto-fix)
```

### Tests
```bash
vendor/bin/pest                                         # Todos los tests
vendor/bin/pest tests/Feature/                          # Solo Feature tests
vendor/bin/pest tests/Feature/Models/                   # Tests de modelos
vendor/bin/pest tests/Feature/Dashboard/Budgets/        # Tests de presupuestos merch
vendor/bin/pest tests/Feature/Dashboard/PickingBudgets/ # Tests de presupuestos picking
```

---

## Estructura de directorios

```
app/
├── Enums/
│   ├── BudgetStatus.php          # Estados compartidos de presupuestos
│   └── PickingServiceType.php    # Tipos de servicios de picking
├── Http/
│   ├── Controllers/
│   │   ├── Dashboard/            # Controladores del panel admin
│   │   ├── Public/               # Controladores de acceso público (token, sitio)
│   │   │   └── Site/             # Páginas del sitio institucional
│   │   └── Api/                  # Endpoints de búsqueda async
│   └── Middleware/
│       └── HandleInertiaRequestsCustom.php  # Selección de root view
├── Mail/                         # 14 clases Mailable
├── Models/                       # 24 modelos Eloquent
└── Services/                     # Lógica de negocio

database/
├── factories/                    # Factories para tests
├── migrations/                   # 43 migraciones
└── seeders/
    ├── RoleSeeder.php            # Crea roles: admin, vendedor, design
    └── PermissionSeeder.php      # Crea y asigna 10 permisos

resources/
├── css/
│   ├── dashboard.css             # CSS global del dashboard
│   └── public.css                # CSS global del sitio público (variables CSS, fuentes)
├── js/
│   ├── components/ui/            # Componentes Radix UI (solo dashboard)
│   ├── hooks/                    # Custom React hooks
│   ├── layouts/
│   │   ├── dashboard/            # Layout del panel admin
│   │   └── public/               # Layout del sitio público (TopHeader, Footer)
│   ├── pages/
│   │   ├── auth/                 # Login, registro, reset password
│   │   ├── dashboard/            # Todas las páginas del admin
│   │   │   ├── budgets/          # Presupuestos merch
│   │   │   ├── picking/          # Presupuestos picking
│   │   │   ├── products/         # Catálogo de productos
│   │   │   ├── categories/       # Categorías
│   │   │   ├── clients/          # Clientes
│   │   │   ├── users/            # Usuarios
│   │   │   ├── roles/            # Roles y permisos
│   │   │   └── slides/           # Carousel del home
│   │   ├── public/
│   │   │   ├── budgets/          # Vista pública de presupuesto merch (Tailwind)
│   │   │   ├── picking/          # Vista pública de presupuesto picking (Tailwind)
│   │   │   └── site/             # Sitio institucional (Bootstrap)
│   │   └── settings/             # Perfil y contraseña
│   └── utils/                    # Helpers y formatters
└── views/
    ├── dashboard.blade.php       # Root view del dashboard (carga Tailwind)
    ├── public.blade.php          # Root view del sitio público (carga Bootstrap)
    ├── emails/                   # Templates de emails
    └── pdf/                      # Templates de PDF
        ├── budget.blade.php      # PDF de presupuesto merch
        └── picking-budget.blade.php

docs/
└── budget-calculations.md        # Documentación de cálculo de totales

tests/
├── Feature/
│   ├── Dashboard/Budgets/        # Tests CRUD, validación y estados (merch)
│   ├── Dashboard/PickingBudgets/ # Tests CRUD y estados (picking)
│   ├── Models/                   # Tests de lógica de cálculo
│   └── Public/                   # Tests de acceso público a presupuestos
└── Unit/
```

---

## Rutas

### Sitio público
| Método | URI | Descripción |
|---|---|---|
| GET | `/` | Homepage con carousel |
| GET | `/nosotros` | Sobre la empresa |
| GET | `/rse` | Responsabilidad social empresarial |
| GET | `/copacking` | Servicios de co-packing |
| GET | `/contacto` | Formulario de contacto |
| POST | `/contacto` | Envío del formulario |
| GET | `/products` | Catálogo de productos |
| GET | `/products/{product}` | Detalle de producto |
| GET | `/carrito` | Carrito / solicitud de presupuesto |
| GET/POST | `/solicitar-presupuesto` | Formulario de solicitud de presupuesto |
| POST | `/newsletter/subscribe` | Suscripción al newsletter |

### Acceso público a presupuestos (por token)
| Método | URI | Descripción |
|---|---|---|
| GET | `/presupuesto/{token}` | Ver presupuesto merch |
| GET | `/presupuesto/{token}/pdf` | Descargar PDF |
| POST | `/presupuesto/{token}/aprobar` | Aprobar (acción del cliente) |
| POST | `/presupuesto/{token}/en-evaluacion` | Marcar en revisión (acción del cliente) |
| GET | `/presupuesto-picking/{token}` | Ver presupuesto picking |
| GET | `/presupuesto-picking/{token}/pdf` | Descargar PDF picking |
| POST | `/presupuesto-picking/{token}/aprobar` | Aprobar picking |
| POST | `/presupuesto-picking/{token}/en-evaluacion` | Marcar en revisión picking |

### Dashboard (requiere autenticación)
| Prefix | Recurso | Permisos requeridos |
|---|---|---|
| `/dashboard` | — | Autenticado |
| `/dashboard/users` | UserController | `gestionar_usuarios` |
| `/dashboard/clients` | ClientController | `gestionar_clientes` |
| `/dashboard/roles` | RoleController | `gestionar_roles` |
| `/dashboard/products` | ProductController | `gestionar_productos` |
| `/dashboard/categories` | CategoryController | `gestionar_categorias` |
| `/dashboard/budgets` | BudgetController | `gestionar_presupuestos_merch` |
| `/dashboard/picking` | PickingBudgetController | `gestionar_presupuestos_pick` |
| `/dashboard/picking-config` | PickingConfigurationController | `gestionar_costos_pick` |
| `/dashboard/slides` | SlideController | `gestionar_slides` |

### API interna (requiere autenticación)
| Método | URI | Descripción |
|---|---|---|
| GET | `/api/products/search` | Búsqueda de productos (combobox async) |
| GET | `/api/products/{id}` | Detalle de producto |
| GET | `/api/clients/search` | Búsqueda de clientes (combobox async) |
| GET | `/api/v1/slides` | Slides activos (público) |

### Preview de emails (solo entorno local)
```
/dev/mails/ (Listado de todos los correos)
/dev/mails/budget-sent
/dev/mails/picking-budget-sent
/dev/mails/budget-expiry-warning
/dev/mails/contact-message
```

---

## Sistema de roles y permisos

### Roles del sistema

| Rol | Descripción |
|---|---|
| `admin` | Acceso completo. Ve y edita todo. Puede exportar datos. |
| `vendedor` | Ve y edita solo sus propios clientes y presupuestos. |
| `design` | Solo gestiona slides del carousel. |

### Permisos

| Permiso | Admin | Vendedor | Design |
|---|---|---|---|
| `gestionar_usuarios` | ✓ | — | — |
| `gestionar_clientes` | ✓ | ✓ | — |
| `gestionar_roles` | ✓ | — | — |
| `gestionar_productos` | ✓ | ✓ | — |
| `gestionar_categorias` | ✓ | ✓ | — |
| `gestionar_imagenes_de_productos` | ✓ | ✓ | — |
| `gestionar_presupuestos_merch` | ✓ | ✓ | — |
| `gestionar_presupuestos_pick` | ✓ | ✓ | — |
| `gestionar_costos_pick` | ✓ | — | — |
| `gestionar_slides` | ✓ | — | ✓ |

Los vendedores solo ven y pueden editar los clientes y presupuestos asignados a ellos. Los admins ven y pueden editar todo.

Los roles son `is_system = true` y no pueden eliminarse.

---

## Modelos principales

### Users y Clients

- `User` — usuarios del sistema (admin, vendedor, design). Campo `role_id`.
- `Role` — rol del usuario con permisos asociados.
- `Permission` — permiso individual (`gestionar_*`). Relación many-to-many con Role.
- `Client` — cliente de la empresa. `user_id` apunta al vendedor propietario. Todos usan soft delete.

### Productos

- `Product` — producto del catálogo. Puede tener origen `local` o `Zecat` (sincronizado desde API externa). Campo `is_visible_in_front` controla visibilidad en el sitio público.
- `ProductVariant` — variante de un producto (distinto SKU, precio, stock). Relacionada con `ProductAttribute`.
- `ProductAttribute` — atributo de variante (ej: Color: Rojo, Talle: M).
- `ProductImage` — imagen de un producto. Una imagen puede ser `is_featured = true`.
- `Category` — categoría de producto. Relación many-to-many con Product.

### Presupuestos Merch

- `Budget` — presupuesto de merchandising. Token único para acceso público.
- `BudgetItem` — línea del presupuesto: producto, cantidad, precio unitario, tiempo de producción, tipo de impresión del logo. Puede pertenecer a un grupo de variantes (`variant_group`).

### Presupuestos Picking

- `PickingBudget` — presupuesto de logística. Token único para acceso público.
- `PickingBudgetService` — servicio incluido en el presupuesto (armado, palletizado, rotulado, etc.).
- `PickingBudgetBox` — caja seleccionada para el presupuesto.
- `PickingBox` — tipo de caja disponible para picking.
- `PickingCostScale` — escala de costos por volumen de kits. Define precios por servicio para rangos de cantidad.
- `PickingComponentIncrement` — incremento porcentual según cantidad de componentes por kit.
- `PickingPaymentCondition` — condición de pago compartida entre Merch y Picking.

### Otros

- `Slide` — slide del carousel del homepage. Con título, imagen, enlace y orden.
- `ContactMessage` — mensaje recibido por el formulario de contacto.
- `NewsletterSubscriber` — suscriptor al newsletter.

---

## Sistema de presupuestos

### Ciclo de vida (ambos tipos)

```
Nuevo presupuesto
      ↓
   unsent ←──── duplicar ──── (otro estado)
      ↓ (draft si es duplicado)
   draft
      ↓ enviar email
    sent ──────────────────── cliente pone en evaluación ──→ in_review
      │                                                          │
      └── cliente aprueba ──→ approved ←───────────────────────┘
      │
      └── cliente rechaza ──→ rejected
      │
      └── vence por fecha  ──→ expired
```

**Estados editables**: `unsent`, `draft`
**Estados visibles públicamente**: `sent`, `in_review`, `approved`, `rejected`
**Estados finales**: `approved`, `rejected`

Los estados `approved` y `rejected` no cambian automáticamente. Un presupuesto vencido (`expired`) no puede cambiar de estado; debe duplicarse.

### Acceso público por token

Cada presupuesto tiene un token de 32 caracteres generado automáticamente. El cliente accede sin autenticación a `/presupuesto/{token}` o `/presupuesto-picking/{token}` y puede ver, descargar el PDF y aprobar/poner en revisión.

### Variantes en presupuestos Merch

Los items de un presupuesto pueden agruparse por `variant_group`. Dentro de cada grupo, solo la variante marcada `is_selected = true` se incluye en el subtotal. En la vista pública y en el show del dashboard, el cliente o el vendedor pueden cambiar la variante seleccionada; este cambio actualiza el total visualizado en tiempo real (pero no persiste la selección en el servidor).

### Cálculo de totales

Ver documentación detallada en [`docs/budget-calculations.md`](docs/budget-calculations.md).

**Resumen Merch:**
```
SUBTOTAL = SUM(line_total) de items regulares + variantes seleccionadas
TOTAL    = (SUBTOTAL + condición_de_pago) × (1 + IVA)
```

**Resumen Picking:**
```
SERVICES_SUBTOTAL = SUM(servicios)
TOTAL = ((SERVICES_SUBTOTAL × (1 + incremento_componentes)) + cajas + condición_de_pago) × (1 + IVA)
UNIT_PRICE_PER_KIT = TOTAL / total_kits
```

---

## Sistema de emails

Los emails se envían a través de la **queue**. Los 14 Mailables implementan `ShouldQueue`, por lo que el despacho con `Mail::to()->send()` encola el job en lugar de enviar en el mismo request HTTP. El envío real ocurre cuando el queue worker procesa el job (en producción, en el siguiente ciclo del cron de cada minuto).

> La queue usa driver `database`. En producción, el scheduler ejecuta `queue:work --stop-when-empty --tries=3` cada minuto sin necesidad de supervisor (ver [Tareas programadas](#tareas-programadas)).

#### PDFs en emails

`BudgetCreatedMail` y `PickingBudgetSent` adjuntan el PDF al email. Para evitar que el objeto DomPDF (no serializable) se almacene en la queue, la generación del PDF ocurre **dentro del método `attachments()`** del Mailable, es decir en tiempo de ejecución del job — no al hacer el dispatch. Los servicios `BudgetPdfService` y `PickingBudgetPdfService` en `app/Services/` encapsulan esta lógica.

### Emails del sistema

| Evento | Destinatario | Mailable |
|---|---|---|
| Presupuesto merch enviado | Cliente | `BudgetCreatedMail` |
| Presupuesto picking enviado | Cliente | `PickingBudgetSent` |
| Presupuesto aprobado | Vendedor | `BudgetApprovedVendorMail` / `PickingBudgetApprovedVendorMail` |
| Presupuesto rechazado | Vendedor | `BudgetRejectedVendorMail` / `PickingBudgetRejectedVendorMail` |
| Presupuesto en revisión | Vendedor | `BudgetInReviewVendorMail` / `PickingBudgetInReviewVendorMail` |
| Aviso de vencimiento próximo | Vendedor + Cliente | `BudgetExpiryWarningMail` / `BudgetExpiryWarningClientMail` |
| Presupuesto vencido | Vendedor + Cliente | `BudgetExpiredMail` / `BudgetExpiredClientMail` |
| Formulario de contacto | Admin | `ContactMessageReceivedMail` |
| Solicitud de presupuesto | Admin | `NewQuoteRequestMail` |

Los templates están en `resources/views/emails/`. Para previsualizar en desarrollo: `/dev/mails/*`.

---

## Generación de PDFs

Los PDFs se generan con `barryvdh/laravel-dompdf` desde templates Blade en `resources/views/pdf/`:

- `budget.blade.php` — Presupuesto de merchandising
- `picking-budget.blade.php` — Presupuesto de picking

**Disponible para:**
- Descarga desde el dashboard (`downloadPdf`)
- Descarga pública por token
- Adjunto en el email al cliente

Los PDFs solo pueden generarse si el presupuesto no tiene entidades eliminadas (cliente, vendedor, condición de pago). El método `hasInvalidEntitiesForPdf()` en cada controlador valida esto antes de generar.

La lógica de generación de PDFs está centralizada en servicios dedicados:

| Servicio | Archivo |
|---|---|
| `BudgetPdfService` | `app/Services/BudgetPdfService.php` |
| `PickingBudgetPdfService` | `app/Services/PickingBudgetPdfService.php` |

Cada servicio expone `generate(Budget|PickingBudget $budget)` (devuelve instancia DomPDF) y `filename($budget)` (devuelve el nombre de archivo estándar). Son usados tanto por los controladores (para descarga directa) como por los Mailables (para el adjunto).

---

## Tareas programadas

El sistema usa el scheduler de Laravel con **un único cron en producción** que corre cada minuto:

```
# Cron en producción (cPanel / servidor)
* * * * * cd /home/centralnorte/public_html/app && /usr/bin/php artisan schedule:run >> /home/centralnorte/public_html/app/storage/logs/cron.log 2>&1
```

Todas las tareas están definidas en `bootstrap/app.php` dentro de `->withSchedule(...)`.

### Tareas registradas

| Tarea | Frecuencia | Comando | Descripción |
|---|---|---|---|
| Procesar queue | Cada minuto | `queue:work --stop-when-empty --tries=3 --max-time=50` | Procesa trabajos pendientes y se detiene cuando la queue está vacía. Sin overlapping. |
| Sincronizar productos | Diaria 03:00 | `products:sync` | Importa/actualiza productos desde la API de Zecat. |
| Vencer presupuestos | Diaria 04:00 | `budgets:check-expired` | Marca como `expired` los presupuestos que superaron su fecha de vencimiento. |
| Notificaciones de vencimiento | Cada hora | `budget:send-notifications` | Envía emails a vendedor y cliente cuando un presupuesto está próximo a vencer o ya venció. |
| Limpiar jobs fallidos | Diaria | `queue:prune-failed --hours=48` | Elimina de la tabla `failed_jobs` los registros con más de 48 horas. |
| Podar modelos expirados | Diaria | `model:prune` | Elimina definitivamente registros soft-deleted que cumplan la política de pruning. |

### Queue en producción

La queue **no usa supervisor ni daemon externo**. El scheduler ejecuta `queue:work --stop-when-empty` cada minuto. Al completar todos los jobs disponibles (o si no hay ninguno), el worker se detiene solo. Esto evita procesos zombies y no requiere configuración adicional en el servidor.

Los jobs que pasan por la queue son:
- **Todos los emails** (14 Mailables con `ShouldQueue`): envío de presupuestos, notificaciones de estado, avisos de vencimiento, formulario de contacto.
- **`SyncProductsJob`**: sincronización de productos desde Zecat, disparada manualmente o por la tarea diaria `products:sync`.

### En desarrollo

`composer run dev` incluye `php artisan queue:listen --tries=1`, que mantiene un worker escuchando la queue de forma continua durante el desarrollo.

---

## Productos — Sincronización con Zecat

Los productos con `origin = 'Zecat'` provienen de una API externa. La sincronización puede iniciarse:
- **Manualmente** desde el dashboard (botón "Sincronizar productos"), que despacha `SyncProductsJob` a la queue.
- **Automáticamente** cada día a las 03:00 AM vía el comando `products:sync` del scheduler.

Los productos locales (`origin = 'local'`) se crean manualmente en el dashboard.

El campo `is_visible_in_front` controla si el producto aparece en el sitio público, independientemente de su origen.

---

## Sitio público institucional

El sitio público (`resources/js/pages/public/site/`) usa el patrón de Inertia persistent layout:

```jsx
const Page = () => { /* contenido con Bootstrap grid */ };
Page.layout = (page) => <LayoutPublic children={page} />;
export default Page;
```

**Páginas:**
- **Home** (`/`) — Carousel de slides + secciones de servicios
- **Nosotros** (`/nosotros`) — Información corporativa, equipo, partners
- **RSE** (`/rse`) — Responsabilidad social
- **Co-packing** (`/copacking`) — Descripción del servicio de co-packing
- **Contacto** (`/contacto`) — Formulario de contacto
- **Productos** (`/products`) — Catálogo con filtros
- **Carrito** (`/carrito`) — Solicitud de presupuesto

Los datos compartidos del layout (redes sociales, etc.) se inyectan vía `HandleInertiaRequests.php` desde `config/business.php`.

---

## Variables de entorno relevantes

```env
# Base
APP_ENV=local
APP_URL=http://localhost

# Base de datos
DB_CONNECTION=mysql
DB_DATABASE=central_norte

# Email
MAIL_MAILER=smtp
MAIL_FROM_ADDRESS=no-reply@centralnortesrl.com

# IVA
IVA_RATE=21           # Porcentaje (se convierte a decimal internamente)
APPLY_IVA=true

# Presupuestos
BUDGET_VALIDITY_DAYS=30
BUDGET_WARNING_DAYS=3

# Redes sociales (sitio público)
SOCIAL_FACEBOOK=
SOCIAL_INSTAGRAM=
SOCIAL_TIKTOK=
SOCIAL_LINKEDIN=

# Admin
ADMIN_EMAIL=
```

---

## Tests

El proyecto usa Pest sobre PHPUnit con `RefreshDatabase` habilitado para todos los Feature tests.

```bash
vendor/bin/pest               # Todos los tests
vendor/bin/pest --no-coverage # Sin reporte de cobertura (más rápido)
```

**Cobertura actual:**

| Área | Tests |
|---|---|
| Cálculo de totales Merch | `tests/Feature/Models/BudgetCalculationTest.php` |
| Cálculo de totales Picking | `tests/Feature/Models/PickingBudgetCalculationTest.php` |
| CRUD y permisos Merch | `tests/Feature/Dashboard/Budgets/` |
| CRUD y permisos Picking | `tests/Feature/Dashboard/PickingBudgets/` |
| Estados de presupuestos | `tests/Feature/Dashboard/Budgets/BudgetStatusTest.php` |
| Acceso público (token) | `tests/Feature/Public/` |

Los helpers `createAdmin()` y `createVendor()` están definidos en `tests/Pest.php` y requieren `RoleSeeder` y `PermissionSeeder` ejecutados en `beforeEach`.

---

## Deployment

```bash
# Antes de deploy
vendor/bin/pint          # Formatear PHP
npm run format           # Formatear JS
vendor/bin/pest          # Correr tests
npm run build            # Build de assets

# En producción
php artisan migrate --force
php artisan optimize
php artisan config:cache
php artisan route:cache
```

**Checklist de producción:**
- `APP_ENV=production`, `APP_DEBUG=false`
- Cron configurado para `php artisan schedule:run` cada minuto (el scheduler gestiona la queue y todas las tareas automáticas)
- Permisos en `storage/` y `bootstrap/cache/`: `775`
- Configurar SMTP / Mailgun
- Configurar `ADMIN_EMAIL` para recibir notificaciones del formulario de contacto
