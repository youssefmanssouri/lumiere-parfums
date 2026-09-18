# Lumière Parfums — Luxury Fragrance E-Commerce Boutique

> **Custom Fragrance E-Commerce Experience** designed to present olfactory products through visual storytelling, guide online discovery with note-based filtering, and provide a seamless journey from browsing to checkout.
>
> Designed & Built by **[Youssef Manssouri](https://www.youssefmanssouri.site)**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-3A171C?style=flat-square&logo=vercel)](https://lumiere-parfums-mu.vercel.app)
[![Case Study](https://img.shields.io/badge/Portfolio-Case%20Study-A65F4B?style=flat-square)](https://www.youssefmanssouri.site/projects/lumiere-parfums)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🔗 Live Access

- **Live Storefront Demo**: [https://lumiere-parfums-mu.vercel.app](https://lumiere-parfums-mu.vercel.app)
- **Engineering Case Study**: [https://www.youssefmanssouri.site/projects/lumiere-parfums](https://www.youssefmanssouri.site/projects/lumiere-parfums)

---

## 💡 Overview & Problem/Solution

### The Problem
Shopping for fragrance online presents a fundamental sensory hurdle: customers cannot smell products through a screen. Standard e-commerce grids that present simple product images and prices fail to convey the character, accords, and composition of a scent, resulting in hesitation and lower conversion.

### The Solution
**Lumière Parfums** addresses this limitation through a domain-tailored discovery engine. Products are structured around olfactory note pyramids (Top, Heart, and Base notes), allowing shoppers to filter fragrances by sensory accords. Paired with rich product storytelling, a persistent slide-out shopping cart, and a responsive boutique aesthetic, the application provides an intuitive exploration pathway.

---

## ✨ Core Implemented Features

1. **Scent Discovery & Olfactory Filtering**:
   - Filter fragrances by scent family (Citrus, Floral, Woody, Oriental, Fresh, Gourmand) and specific notes (Bergamot, Cedarwood, Oud, Vanilla, Jasmine, Amber, etc.).
   - Visual scent pyramid breakdown (Top, Heart, Base notes) detailing fragrance evolution over time.

2. **Visual Product Storytelling**:
   - Immersive product showcase with dedicated detail views, accord tags, concentration levels (Eau de Parfum, Extrait), and volume selections (50ml, 100ml).

3. **Persistent Shopping Cart**:
   - Slide-out cart drawer with instant quantity updates, subtotal calculations, and state persistence across page navigation using React Context and storage hydration.

4. **Streamlined Checkout Experience**:
   - Step-by-step guest and customer checkout flow with form validation and order confirmation summary.

5. **Administrative Catalog Management**:
   - Dedicated management view (`/admin`) for reviewing store inventory, managing product statuses, and monitoring order activity.

---

## 📐 Architecture

```text
               Browser Client (React 19 / Tailwind CSS 4)
                                   │
      ┌────────────────────────────┴────────────────────────────┐
      ▼                                                         ▼
Public Storefront Routes                                   Client Context & State
- Home (/), Shop (/shop), About (/about)                  - CartContext (Cart drawer & persistence)
- Product Details & Discovery Modal                       - AuthContext (Session state)
- Checkout & Order Confirmation (/checkout)
      │                                                         │
      └────────────────────────────┬────────────────────────────┘
                                   ▼
                      Next.js 15 App Router Layer
                      - Server Actions & Route Handlers
                      - Zod Schema Validation
                                   │
                                   ▼
                       Prisma ORM & Persistence
                      - Product, Category, Scent Note models
                      - Order & Customer records
                                   │
                                   ▼
                       Database (PostgreSQL / SQLite)
```

---

## 🛠️ Technology Stack & Purpose

| Technology | Purpose in Project |
|---|---|
| **Next.js 15 (App Router)** | Full-stack server and client component architecture with optimized asset delivery |
| **React 19** | Component-driven UI rendering with modern hooks and transitions |
| **TypeScript 5.8** | Static typing across product catalogs, scent notes, cart operations, and form data |
| **Tailwind CSS v4** | Custom luxury boutique aesthetic, typography, and responsive layouts |
| **Prisma ORM 6** | Structured relational data access for fragrance catalogs, inventory, and orders |
| **Zod** | Runtime validation for checkout submissions and administrative mutations |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)

### 2. Clone & Install
```bash
git clone https://github.com/youssefmanssouri/lumiere-parfums.git
cd lumiere-parfums
npm install
```

### 3. Configure Environment
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Set the database connection string:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-here"
```

### 4. Initialize Database
Generate the Prisma client and push the relational schema:
```bash
npm run db:setup
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👨‍💻 Author

**Youssef Manssouri**
- Portfolio: [https://www.youssefmanssouri.site](https://www.youssefmanssouri.site)
- LinkedIn: [linkedin.com/in/youssef-manssouri-24b4662ba](https://www.linkedin.com/in/youssef-manssouri-24b4662ba/)
- Email: [manssouriyoussef33@gmail.com](mailto:manssouriyoussef33@gmail.com)
