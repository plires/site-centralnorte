# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel + Inertia.js + React application for "Central Norte" - a comprehensive business management system specializing in merchandise budgeting and logistics/picking services. The application features a public-facing client portal and a full-featured administrative dashboard.

**Tech Stack:**
- Backend: Laravel 12 (PHP 8.2+)
- Frontend: React 19 + Inertia.js 2.0
- Database: MySQL with Eloquent ORM

The frontend has **two independent stacks** that share the same React + Inertia base but differ in styling and tooling:

| Aspecto | Dashboard (admin) | Sitio Público |
|---|---|---|
| Blade root view | `resources/views/dashboard.blade.php` | `resources/views/public.blade.php` |
| JS entry point | `resources/js/dashboard.jsx` | `resources/js/public.jsx` |
| CSS entry point | `resources/css/dashboard.css` | `resources/css/public.css` |
| Styling | Tailwind CSS 4 | Bootstrap 5 + CSS Modules |
| UI Components | Radix UI / shadcn | Bootstrap grid + clases utilitarias |
| Icons | Lucide React | react-icons (cualquier set: fa6, si, etc.) |
| Animations | — | AOS (Animate On Scroll) |
| Layout | `resources/js/layouts/dashboard/` | `resources/js/layouts/public/` |
| Pages | `resources/js/pages/dashboard/` | `resources/js/pages/public/site/` |

> **IMPORTANTE:** No mezclar Tailwind en el sitio público ni Bootstrap en el dashboard. Cada stack es independiente.

## Architecture

### Backend (Laravel)

**Directory Structure:**
- `app/Models/` - Eloquent models
- `app/Http/Controllers/Dashboard/` - Admin controllers (authenticated routes)
- `app/Http/Controllers/Public/` - Client-facing controllers (public routes)
- `app/Http/Controllers/Api/` - API endpoints for dynamic data
- `app/Services/` - Business logic services (e.g., `PickingBudgetService`)
- `app/Mail/` - Mailable classes for email notifications
- `database/migrations/` - Database schema migrations
- `database/seeders/` - Database seeders

**Key Models:**
- **Budget System**: `Budget`, `BudgetItem` - Standard merchandise budgeting
- **Picking System**: `PickingBudget`, `PickingBudgetBox`, `PickingBox`, `PickingCostScale`, `PickingComponentIncrement`, `PickingPaymentCondition`
- **Products**: `Product`, `ProductVariant`, `ProductAttribute`, `ProductImage`, `Category`
- **Business**: `Client`, `User`, `Role`
- **UI**: `Slide` (homepage carousel)

**Key Packages:**
- `barryvdh/laravel-dompdf` - PDF generation for budgets
- `phpoffice/phpspreadsheet` - Excel export functionality
- `intervention/image` - Image processing
- `tightenco/ziggy` - Route generation for JavaScript

### Frontend (React + Inertia)

**Directory Structure:**
- `resources/js/dashboard.jsx` - Dashboard entry point (loads Tailwind CSS)
- `resources/js/public.jsx` - Public site entry point (loads Bootstrap + AOS)
- `resources/js/components/` - Reusable UI components (dashboard only)
  - `resources/js/components/ui/` - Radix UI-based design system components (dashboard)
- `resources/js/layouts/` - Layout wrappers
  - `resources/js/layouts/dashboard/` - Dashboard layout (Tailwind)
  - `resources/js/layouts/public/` - Public site layout (Bootstrap)
    - `resources/js/layouts/public/public-layout.jsx` - Layout principal del sitio público
    - `resources/js/layouts/public/components/` - Componentes del layout público (TopHeader, Footer, etc.)
    - `resources/js/layouts/public/components/*.module.css` - Estilos CSS Module de cada componente
- `resources/js/pages/` - Inertia page components
  - `resources/js/pages/dashboard/` - Admin pages (Tailwind + Radix UI)
  - `resources/js/pages/public/site/` - **Sitio público** (Bootstrap + AOS + react-icons)
  - `resources/js/pages/public/budgets/` - Vistas públicas de presupuestos merch (Tailwind, NO son parte del sitio público)
  - `resources/js/pages/public/picking/` - Vistas públicas de presupuestos picking (Tailwind, NO son parte del sitio público)
  - `resources/js/pages/public/components/` - Componentes compartidos de vistas de presupuestos (Tailwind)
  - `resources/js/pages/auth/` - Authentication pages
  - `resources/js/pages/settings/` - User settings pages
- `resources/js/utils/` - Helper functions and utilities
- `resources/js/hooks/` - Custom React hooks
- `resources/css/public.css` - CSS global del sitio público (variables CSS, fuentes, layout flex)
- `resources/css/dashboard.css` - CSS global del dashboard

**Dashboard Technologies:**
- Tailwind CSS 4 with custom theme
- Radix UI primitives (Dialog, Dropdown, Select, etc.)
- TanStack Table for data tables
- Lucide React for icons
- Sonner for toast notifications
- date-fns for date formatting
- cmdk for command palette

**Public Site Technologies:**
- Bootstrap 5 (grid system, utility classes, responsive breakpoints)
- CSS Modules (archivos `*.module.css` para estilos por componente)
- AOS (Animate On Scroll) for scroll animations
- react-icons (cualquier set de iconos: `react-icons/fa6`, `react-icons/si`, etc.)
- CSS custom properties defined in `resources/css/public.css`

## Development Commands

### Quick Development Start
```bash
composer run dev
```
This runs a comprehensive development environment with:
- Laravel server (`php artisan serve`)
- Queue worker (`php artisan queue:listen --tries=1`)
- Log monitoring (`php artisan pail --timeout=0`)
- Vite dev server (`npm run dev`)

### Individual Commands

#### Backend (Laravel)
- `php artisan serve` - Start Laravel development server
- `php artisan migrate` - Run database migrations
- `php artisan db:seed` - Seed database
- `php artisan queue:work` - Process queues
- `php artisan tinker` - Interactive shell
- `vendor/bin/pint` - PHP code formatting (Laravel Pint)
- `vendor/bin/phpunit` - Run PHP tests

#### Frontend (Node.js/React)
- `npm run dev` - Start Vite development server
- `npm run build` - Production build
- `npm run build:ssr` - Build with server-side rendering
- `npm run lint` - ESLint code checking
- `npm run format` - Prettier code formatting
- `npm run format:check` - Check code formatting

#### Testing
- `vendor/bin/phpunit` - Run all PHP tests
- `vendor/bin/phpunit tests/Feature/` - Run feature tests only
- `vendor/bin/phpunit tests/Unit/` - Run unit tests only

## Key Business Domains

### Budget System
The application manages two distinct budget types:

#### 1. Merchandise Budgets (`Budget` model)
- Standard product budgeting with items and variants
- Multiple product variants per budget item (client can select one from each variant group)
- Payment condition adjustments (percentage applied to subtotal)
- Optional IVA calculation (configurable rate)
- Production time tracking per item
- Logo printing options per item
- Budget comments and rejection feedback
- Seller assignment for each budget
  
#### 2. Picking Budgets (`PickingBudget` model)
- Logistics and warehouse picking services
- Complex pricing based on multiple factors:
  - Box types and quantities (`PickingBudgetBox`)
  - Service selections ('assembly','palletizing','labeling','dome_sticking','additional_assembly','quality_control','shavings','bag','bubble_wrap') via `PickingBudgetService`
  - Component increments for additional materials
  - Cost scaling tiers based on volume (`PickingCostScale`)
  - Payment conditions affecting final pricing
- Total kits and components per kit tracking
- Production time estimation
- Unit price per kit calculation
- Detailed notes and observations
- Same status workflow as merchandise budgets

### Budget Status Workflow
All budgets follow this lifecycle (defined in `App\Enums\BudgetStatus.php`):

1. **unsent** - Initial state when budget is created (editable)
2. **draft** - Borrador, typically when cloned/duplicated from another budget (editable)
3. **sent** - Enviado al cliente, publicly visible via token
4. **in_review** - En evaluación, client is evaluating the budget
5. **approved** - Aprobado, client or seller has accepted
6. **rejected** - Rechazado, declined seller
7. **expired** - Vencido, automatically expired due to inactivity

**State Transitions:**
- New budget → `unsent`
- Cloned/duplicated budget → `draft`
- Send email → `sent` (only from `unsent`, `draft`, or `rejected`)
- Client places under review → `in_review` (only from `sent`)
- Client approves → `approved` (from `sent` or `in_review`)
- Seller rejects → `rejected`
- Auto-expiration → `expired` (from `unsent`, `draft`, `sent`, or `in_review`)

**Edit Rules:**
- Editable: `unsent`, `draft`
- Publicly visible: `sent`, `in_review`, `approved`, `rejected`
- Client can take action: `sent`, `in_review`
- Final states (no automatic changes): `approved`, `rejected`

### Product System
- Products with multiple variants (color, size, material)
- Each variant has its own SKU, price, and stock
- Product attributes for variant options
- Product images with featured image selection
- Category organization
- Support for product synchronization from external systems

### Permission System
Role-based access control with granular permissions:
- `gestionar_usuarios` - User management
- `gestionar_clientes` - Client management
- `gestionar_roles` - Role and permission management
- `gestionar_productos` - Product catalog management
- `gestionar_categorias` - Category management
- `gestionar_presupuestos_merch` - Merchandise budget management
- `gestionar_presupuestos_picking` - Picking budget management
- `gestionar_slides` - Homepage carousel management
- `gestionar_imagenes_de_productos` - Product image management
- `admin` - Full system access and exports

## Database Migrations

Migrations follow Laravel conventions. To create a new migration:
```bash
php artisan make:migration create_table_name_table
php artisan make:migration add_column_to_table_name_table
```

Key migration patterns in this project:
- All budgets use `token` column for public access (unique, indexed)
- Status columns use enum: 'sent', 'in_review', 'approved', 'rejected'
- Foreign keys follow naming convention: `{singular_table}_id`
- Soft deletes are used on most models (deleted_at timestamp)
- Created/updated timestamps on all tables

## Code Style and Formatting

### PHP (Laravel Pint)
- **Standard**: PSR-12 with Laravel conventions
- **Command**: `vendor/bin/pint`
- **Auto-fix**: Run before committing
- **Key conventions**:
  - Use type hints for parameters and return types
  - Use array syntax `[]` instead of `array()`
  - Follow Laravel naming conventions (models: PascalCase, tables: snake_case)

### JavaScript/React (Prettier + ESLint)
- **Formatting**: Run `npm run format` (auto-fix) or `npm run format:check` (check only)
- **Linting**: Run `npm run lint`
- **Configuration**:
  - Semi-colons required
  - Single quotes for strings
  - 4-space indentation
  - Print width: 150 characters
  - Tailwind class sorting enabled (automatic via plugin)
  - Import organization enabled (automatic via plugin)
- **Key conventions**:
  - Components: PascalCase files and exports
  - Hooks: camelCase starting with "use"
  - Props destructuring in function parameters
  - Use functional components with hooks (no class components)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Generate application key: `php artisan key:generate`
3. Configure database in `.env`
4. Install dependencies: `composer install && npm install`
5. Run migrations: `php artisan migrate`
6. Start development: `composer run dev`

## Routes Structure

### Public Routes (No Authentication)
- `/` - Homepage with carousel and company information
- `/nosotros` - About page
- `/presupuesto/{token}` - View merchandise budget (client access)
- `/presupuesto/{token}/pdf` - Download budget as PDF
- `/presupuesto/{token}/aprobar` - Approve budget (client action)
- `/presupuesto/{token}/en-evaluacion` - Mark budget under review (client action)
- `/presupuesto-picking/{token}` - View picking budget (client access)
- `/presupuesto-picking/{token}/pdf` - Download picking budget as PDF
- `/presupuesto-picking/{token}/aprobar` - Approve picking budget
- `/presupuesto-picking/{token}/en-evaluacion` - Mark picking budget under review

### Dashboard Routes (Requires Authentication + Permissions)
- `/dashboard` - Main dashboard home
- `/dashboard/users/*` - User management (requires `gestionar_usuarios` permission)
- `/dashboard/clients/*` - Client management (requires `gestionar_clientes` permission)
- `/dashboard/roles/*` - Role management (requires `gestionar_roles` permission)
- `/dashboard/products/*` - Product management (requires `gestionar_productos` permission)
- `/dashboard/categories/*` - Category management (requires `gestionar_categorias` permission)
- `/dashboard/budgets/*` - Budget management (requires `gestionar_presupuestos_merch` permission)
- `/dashboard/picking/*` - Picking budget management (requires `gestionar_presupuestos_picking` permission)
- `/dashboard/slides/*` - Homepage carousel management (requires `gestionar_slides` permission)

### API Routes (Requires Authentication)
- `/api/products/search` - Search products for combobox
- `/api/clients/search` - Search clients for combobox

### Special Features
- Excel export for clients, products, categories, and budgets (admin only)
- PDF generation for budgets
- Email notifications with budget links
- Product image management with featured image support
- Budget duplication functionality

## SSR Support

The application supports server-side rendering with Inertia.js:
- **Build for SSR**: `npm run build:ssr`
- **Development with SSR**: `composer run dev:ssr`
- SSR improves initial page load and SEO

## Common Development Tasks

### Creating a New Resource
When adding a new CRUD resource (e.g., a new entity):

1. **Create Model and Migration**:
   ```bash
   php artisan make:model ModelName -m
   ```

2. **Create Controller**:
   ```bash
   php artisan make:controller Dashboard/ModelNameController --resource
   ```

3. **Add Routes** in `routes/web.php`:
   ```php
   Route::middleware(['auth', 'verified', 'permission:gestionar_model_name'])
       ->prefix('dashboard')->name('dashboard.')->group(function () {
       Route::resource('model-names', ModelNameController::class);
   });
   ```

4. **Create React Pages**:
   - `resources/js/pages/dashboard/model-names/Index.jsx`
   - `resources/js/pages/dashboard/model-names/Create.jsx`
   - `resources/js/pages/dashboard/model-names/Edit.jsx`
   - `resources/js/pages/dashboard/model-names/Show.jsx`

5. **Create Form Component**:
   - `resources/js/pages/dashboard/model-names/components/ModelNameForm.jsx`

### Adding a New Permission
1. Add permission to database (via seeder or migration)
2. Use in route middleware: `->middleware('permission:permission_name')`
3. Check in controllers: `$request->user()->can('permission_name')`
4. Check in React: `auth.user.permissions.includes('permission_name')`

### Email Notifications
Email templates are in `resources/views/emails/`. To send emails:
1. Create Mailable: `php artisan make:mail MailableName`
2. Define in `app/Mail/MailableName.php`
3. Send via: `Mail::to($user)->send(new MailableName($data))`
4. Queue emails for better performance: `Mail::to($user)->queue(new MailableName($data))`

### PDF Generation
PDFs are generated using dompdf. Example in controllers:
```php
$pdf = PDF::loadView('pdfs.budget', compact('budget'));
return $pdf->download('budget.pdf');
```

## Troubleshooting

### Common Issues

**Queue jobs not processing:**
```bash
php artisan queue:work
# or use the dev script which includes queue listener
composer run dev
```

**CSS not updating:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Migrations failing:**
```bash
# Rollback and re-run
php artisan migrate:rollback
php artisan migrate
```

**Permission denied errors:**
```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
```

**Inertia version mismatch:**
```bash
# Clear Inertia cache
php artisan optimize:clear
```

## Testing Guidelines

### Feature Tests
Feature tests should test HTTP endpoints and business logic:
```bash
php artisan make:test FeatureNameTest
vendor/bin/phpunit tests/Feature/FeatureNameTest.php
```

### Unit Tests
Unit tests should test isolated functionality:
```bash
php artisan make:test UnitNameTest --unit
vendor/bin/phpunit tests/Unit/UnitNameTest.php
```

### Test Database
Tests use a separate database configuration. Ensure `.env.testing` is configured.

## Deployment Notes

**Before deploying:**
1. Run tests: `vendor/bin/phpunit`
2. Format code: `vendor/bin/pint && npm run format`
3. Build assets: `npm run build` or `npm run build:ssr`
4. Clear caches: `php artisan optimize:clear`

**Production checklist:**
- Set `APP_ENV=production`
- Set `APP_DEBUG=false`
- Configure proper database credentials
- Set up queue workers (supervisor recommended)
- Configure email settings (SMTP)
- Set proper file permissions
- Run migrations: `php artisan migrate --force`
- Optimize: `php artisan optimize && php artisan config:cache && php artisan route:cache`

## Git Workflow

Current branch: `create-picking-budgets`
Main branch: `master`

**Branch naming conventions:**
- Feature: `feature/description`
- Bugfix: `bugfix/description`
- Hotfix: `hotfix/description`

**Commit message guidelines:**
- Use clear, descriptive messages
- Start with a verb (Add, Fix, Update, Remove)
- Reference issues if applicable

## Project-Specific Notes

### Public Site Architecture (Sitio Público)

The public site and the dashboard are **two separate Inertia applications** that share the same Laravel backend but use different Blade root views, JS entry points, and CSS stacks.

**Dual Root View Mechanism:**
The middleware `HandleInertiaRequestsCustom` (`app/Http/Middleware/HandleInertiaRequestsCustom.php`) determines which Blade root view to use based on the route name:
- Routes named `public.home`, `public.nosotros`, etc. → `resources/views/public.blade.php` (loads Bootstrap + AOS)
- Routes named `public.budget.*`, `public.picking.budget.*` → `resources/views/dashboard.blade.php` (loads Tailwind)
- All other routes (dashboard, auth, settings) → `resources/views/dashboard.blade.php` (loads Tailwind)

This means the budget/picking public views (`resources/js/pages/public/budgets/`, `resources/js/pages/public/picking/`) are **NOT** part of the public site — they use the dashboard Blade template and Tailwind CSS. They are small standalone views for clients to see their budgets via token URLs.

**Public Site File Structure:**
```
resources/js/layouts/public/
├── public-layout.jsx                    # Layout principal (TopHeader + main + Footer)
└── components/
    ├── TopHeader.jsx                    # Barra superior con redes sociales
    ├── TopHeader.module.css
    ├── Footer.jsx                       # Footer con logo, navegación y redes sociales
    └── Footer.module.css

resources/js/pages/public/site/          # Páginas del sitio público
├── home/
│   └── Home.jsx
└── nosotros/
    └── Nosotros.jsx
```

**Inertia Persistent Layout Pattern:**
Each public site page uses the Inertia persistent layout pattern to avoid remounting the layout on navigation:
```jsx
import LayoutPublic from '@/layouts/public/public-layout';

const PageName = () => {
    return ( /* page content using Bootstrap grid */ );
};

PageName.layout = (page) => <LayoutPublic children={page} />;

export default PageName;
```

**Shared Data via Inertia:**
The layout components (TopHeader, Footer) read shared data from `usePage().props` instead of receiving props from each page. This data is shared from `HandleInertiaRequests.php`:
- `socialLinks` — Social media URLs configured in `config/business.php` via environment variables (`SOCIAL_FACEBOOK`, `SOCIAL_INSTAGRAM`, etc.)

**CSS Convention for the Public Site:**
- **Global styles**: `resources/css/public.css` — CSS variables (`:root`), font families, flex layout for `#app`
- **Component styles**: CSS Modules (`*.module.css`) colocated next to each component
- **Grid and layout**: Use Bootstrap 5 classes (`container`, `row`, `col-*`, `d-flex`, `justify-content-*`, etc.)
- **Colors**: Use CSS variables from `public.css` (`--primary-color`, `--secondary-color`, `--tertiary-color`, `--neutral-color`)
- **Icons**: Use `react-icons` (any icon set, not limited to Bootstrap icons)
- **Animations**: Use AOS `data-aos` attributes on elements

**Creating a New Public Site Page:**
1. Create controller in `app/Http/Controllers/Public/Site/`
2. Add route in `routes/web.php` with `public.*` name prefix
3. Create page component in `resources/js/pages/public/site/{section}/PageName.jsx`
4. Apply the persistent layout pattern: `PageName.layout = (page) => <LayoutPublic children={page} />;`
5. Use Bootstrap grid, CSS Modules, AOS, and react-icons (NO Tailwind)

### Token-Based Public Access
Both budget types use unique tokens for public access without authentication:
- Tokens are generated automatically on budget creation
- Format: 40-character random string
- Used in URLs: `/presupuesto/{token}` and `/presupuesto-picking/{token}`
- Ensures security while allowing client access

### Budget Email Workflow
1. Admin creates budget in dashboard
2. Admin clicks "Send Email" button
3. Email sent to client with public link
4. Client can view, download PDF, and approve/review
5. Status updates sent back to admin dashboard
6. Email notification sent to seller on status change

### Product Variants System
Products can have multiple variants (e.g., different colors/sizes):
- Variants are managed through `ProductVariant` model
- Each variant has unique SKU, price, stock level
- Attributes define variant options (e.g., Color: Red, Blue)
- Budgets link to specific variants, not just products

### Picking Cost Calculation
Picking budget costs are complex:
1. Base price from `PickingBox` model
2. Modified by quantity tiers (`PickingCostScale`)
3. Additional costs from services (taping, stickering, etc.)
4. Component increments for extra materials
5. Payment conditions can add discounts/fees
6. All calculated in `PickingBudgetService`