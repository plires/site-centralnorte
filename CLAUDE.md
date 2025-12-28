# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel + Inertia.js + React application for "Central Norte" - a business management system with budget creation and picking services. The project uses Laravel 12 as the backend with React for the frontend, connected through Inertia.js for seamless SPA experience.

## Architecture

### Backend (Laravel)
- **Laravel Framework**: Version 12 with PHP 8.2+
- **Database**: MySQL with Eloquent ORM
- **Key Models**:
  - `Budget`, `BudgetItem` - Main budget system
  - `PickingBudget`, `PickingBox`, `PickingCostScale` - Picking/logistics system
  - `Product`, `Category`, `Client` - Core business entities
  - `User`, `Role` - Authentication and authorization
- **Controllers**: Organized in `Dashboard/` (admin) and `Public/` (client-facing) namespaces
- **Services**: Custom business logic in `app/Services/` (e.g., `PickingBudgetService`)
- **Mail**: Email templates in `app/Mail/`

### Frontend (React + Inertia)
- **React 19** with TypeScript support
- **Inertia.js** for server-side rendering and SPA behavior
- **Tailwind CSS 4** with custom components
- **Radix UI** components for UI primitives
- **Two entry points**:
  - `resources/js/dashboard.jsx` - Admin dashboard
  - `resources/js/public.jsx` - Public site
- **Components**: Organized in `resources/js/components/`
- **Pages**: Organized in `resources/js/pages/`
- **Utilities**: Helper functions in `resources/js/utils/`

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
The application handles two types of budgets:
1. **Standard Budgets** (`Budget` model) - General merchandise budgeting
2. **Picking Budgets** (`PickingBudget` model) - Logistics/picking service budgets

### Public vs Dashboard
- **Public routes** (`/`) - Client-facing budget views and company information
- **Dashboard routes** (`/dashboard`) - Administrative interface for managing all data

### Picking System
Complex logistics management system with:
- Multiple box types and sizes (`PickingBox`, `PickingBudgetBox`)
- Cost scaling based on quantity (`PickingCostScale`)
- Component increments (`PickingComponentIncrement`)
- Payment conditions (`PickingPaymentCondition`)

## Database Migrations

Migrations follow Laravel conventions. Recent important migrations include:
- Picking budget system tables (2025-11-* migrations)
- Budget rejection comments (2025-12-18, 2025-12-23)
- Token and status updates for picking budgets (2025-12-10)

## Code Style and Formatting

### PHP (Laravel Pint)
- PSR-12 standard
- Run `vendor/bin/pint` before committing

### JavaScript/React (Prettier + ESLint)
- Semi-colons, single quotes, 4-space tabs
- Print width: 150 characters
- Tailwind class sorting enabled
- Import organization enabled
- Run `npm run format` and `npm run lint` before committing

## Environment Setup

1. Copy `.env.example` to `.env`
2. Generate application key: `php artisan key:generate`
3. Configure database in `.env`
4. Install dependencies: `composer install && npm install`
5. Run migrations: `php artisan migrate`
6. Start development: `composer run dev`

## Routes Structure

- `/` - Public homepage
- `/nosotros` - About page
- `/presupuesto/*` - Public budget views
- `/presupuesto-picking/*` - Public picking budget views
- `/dashboard/*` - Admin dashboard (requires authentication)

## SSR Support

The application supports server-side rendering:
- Use `npm run build:ssr` to build SSR assets
- Use `composer run dev:ssr` to start SSR development environment