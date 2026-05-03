<div align="center">

# Taiko

**AI-powered SaaS platform for small and medium businesses**

[![Java](https://img.shields.io/badge/Java_17+-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_+_pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![OpenAI](https://img.shields.io/badge/OpenAI_API-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)
[![Telegram](https://img.shields.io/badge/Telegram_Bot-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://core.telegram.org/bots)
[![Deployed on Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app/)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**[🚗 Live Demo](https://frontend-xi-navy-88.vercel.app)**

</div>

---

## What is Taiko?

Taiko is a full-stack SaaS platform that gives small businesses a clean interface to manage their inventory and an AI chatbot that answers customer questions in natural language — using that same inventory as its real-time knowledge base.

The AI layer is built on **Retrieval-Augmented Generation (RAG)**: customer queries are converted to vector embeddings, semantically similar catalog items are retrieved via `pgvector`, and a language model generates accurate, grounded responses. A second LLM pass acts as a strict "judge" filtering results by hard constraints like price or color before returning them.

The core architecture is **industry-agnostic**. The current implementation is a fully-featured car dealership. The same platform adapts to any type of catalog with minimal schema changes.

---

## Features

### Customer-facing
- **AI Chatbot** — natural language queries against the live inventory; recommends specific items with cards linking to detail pages
- **Semantic search** — find vehicles by description ("automatic SUV for family under 30k") using vector similarity
- **Conversation history** — sessions persisted per user; resumable across devices
- **Export** — download any chat as PDF, TXT or structured JSON
- **Telegram Bot** — full chatbot experience via Telegram, connected to the same AI and inventory

### Admin panel
- **Vehicle CRUD** — create, edit and delete catalog items with images, relations and all metadata
- **Bulk import** — upload a `.csv` or `.xlsx` file to import hundreds of vehicles at once; embeddings auto-generated
- **Image management** — multi-image upload per vehicle with primary image selection
- **User management** — view all users, edit name/email/phone/role, activate or deactivate accounts
- **Role system** — `admin` and `cliente` roles with full Spring Security enforcement at every endpoint
- **Analytics dashboard** — KPI cards (vehicles, users, conversations, messages), 30-day time series charts, top-5 recommended vehicles by the chatbot, and channel distribution (web vs Telegram)

### Platform
- **JWT authentication** — stateless tokens, configurable expiration, BCrypt password hashing
- **Dark / light mode** — system-wide theme toggle persisted across navigation
- **Responsive UI** — works on desktop and mobile
- **SPA routing** — no 404s on page reload (Vercel rewrite rules)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        React 18 Frontend                      │
│     Inventory · Chat · Admin Panel · Profile · My Chats       │
└─────────────────────────┬────────────────────────────────────┘
                          │  REST API  ·  JWT Bearer tokens
┌─────────────────────────▼────────────────────────────────────┐
│                     Spring Boot 3 Backend                     │
│                                                               │
│  ┌──────────────────┐   ┌──────────────────────────────────┐  │
│  │  Spring Security  │   │           RAG Engine             │  │
│  │  JWT · Roles      │   │  Spring AI  ·  OpenAI API        │  │
│  │  Method Security  │   │  Embeddings: text-embedding-3-   │  │
│  └──────────────────┘   │  small  ·  Chat: gpt-4o-mini      │  │
│                          │  LLM Judge for strict filtering   │  │
│  ┌──────────────────┐   └──────────────────────────────────┘  │
│  │  Telegram Webhook │                                         │
│  │  Bot integration  │                                         │
│  └──────────────────┘                                         │
└─────────────────────────┬────────────────────────────────────┘
                          │  JPA  ·  pgvector similarity search
┌─────────────────────────▼────────────────────────────────────┐
│                   PostgreSQL + pgvector                       │
│       Vehicles · Users · Conversations · Embeddings          │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring MVC, Spring Security, Hibernate JPA |
| AI / RAG | Spring AI, OpenAI `text-embedding-3-small` (embeddings), `gpt-4o-mini` (chat) |
| Vector DB | PostgreSQL 16 + `pgvector` extension |
| Frontend | React 18, Vite, React Router v6, react-markdown, Recharts, Lucide icons |
| Auth | JWT (JJWT), BCrypt, role-based access control |
| File import | Apache POI (Excel), OpenCSV |
| Telegram | Telegram Bot API via webhook (Spring RestTemplate) |
| Deployment | Railway (backend + DB), Vercel (frontend) |
| Build | Maven (backend), npm + Vite (frontend) |

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 15+ with `pgvector` extension enabled
- OpenAI API key

### 1. Database setup

```sql
CREATE DATABASE taiko_db;
CREATE EXTENSION IF NOT EXISTS vector;
```

Then run your schema script to create the tables (`vehiculos`, `usuarios`, `conversaciones`, `mensajes`, `vehicle_embeddings`, etc.).

### 2. Backend configuration

Create `backend/src/main/resources/application-secrets.properties` (gitignored):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taiko_db
spring.datasource.username=your_user
spring.datasource.password=your_password
spring.ai.openai.api-key=sk-your-openai-key
jwt.secret=your-base64-secret
telegram.bot.token=your-telegram-bot-token   # optional
```

### 3. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

API available at `http://localhost:8080`.

### 4. Frontend configuration

```bash
cd frontend
cp .env.example .env        # then edit VITE_API_URL
npm install
npm run dev
```

App available at `http://localhost:5173`.

### 5. Generate embeddings

Once you have vehicles in the database, hit this admin endpoint to generate their vector embeddings:

```bash
curl -X POST http://localhost:8080/api/cars/seed \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"
```

### 6. Telegram Bot (optional)

1. Create a bot with [@BotFather](https://t.me/BotFather) and copy the token
2. Set `TELEGRAM_BOT_TOKEN` as an environment variable
3. Register the webhook (replace with your deployed URL):

```bash
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-backend.up.railway.app/api/webhook/telegram"}'
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key for embeddings and chat |
| `JWT_SECRET` | Yes | Base64-encoded secret for signing tokens |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token (omit to disable) |
| `APP_BASE_URL` | No | Public URL of the backend (for image URLs) |
| `PORT` | No | Server port (defaults to 8080) |
| `VITE_API_URL` | Frontend | Base URL of the backend API |

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET` | `/api/cars` | Public | List all vehicles |
| `GET` | `/api/cars/{id}` | Public | Vehicle detail |
| `POST` | `/api/cars/new` | Admin | Create vehicle |
| `PUT` | `/api/cars/{id}` | Admin | Update vehicle |
| `DELETE` | `/api/cars/{id}` | Admin | Delete vehicle |
| `POST` | `/api/cars/import` | Admin | Bulk import CSV/Excel |
| `POST` | `/api/cars/seed` | Admin | Regenerate all embeddings |
| `GET` | `/api/cars/search?q=...` | Public | Semantic search |
| `POST` | `/api/chat/start` | Public | Start conversation |
| `POST` | `/api/chat/{id}/message` | Public | Send message |
| `GET` | `/api/chat/{id}/history` | Public | Get chat history |
| `GET` | `/api/chat/{id}/export/txt` | User | Export as TXT |
| `GET` | `/api/chat/{id}/export/json` | User | Export as JSON |
| `GET` | `/api/chat/mis-conversaciones` | User | List my conversations |
| `DELETE` | `/api/chat/conversaciones/{id}` | User | Delete conversation |
| `GET` | `/api/user/profile` | User | Get profile |
| `PUT` | `/api/user/profile` | User | Update profile |
| `GET` | `/api/admin/users` | Admin | List all users |
| `PUT` | `/api/admin/users/{id}` | Admin | Edit user |
| `DELETE` | `/api/admin/users/{id}` | Admin | Delete user |
| `GET` | `/api/admin/analytics/summary` | Admin | Analytics dashboard data |
| `POST` | `/api/upload/image` | User | Upload image |
| `POST` | `/api/webhook/telegram` | Public | Telegram webhook |

---

## Running tests

The backend includes unit tests for the main services using JUnit 5 and Mockito.

```bash
cd backend
./mvnw test
```

Test classes cover:

- `ChatbotServiceTest` — message flow, conversation persistence and export
- `VehiculoServiceTest` — CRUD, semantic search and embedding generation
- `UserServiceTest` — profile updates and password changes
- `AnalyticsServiceTest` — KPI aggregation
- `BackendApplicationTests` — Spring context loading

To generate a coverage report (if JaCoCo is configured):

```bash
./mvnw test jacoco:report
```

---

## Security

The platform implements defense-in-depth across the stack:

| Layer | Measure |
|---|---|
| Passwords | BCrypt hashing with per-user salt; plaintext never stored or logged |
| Sessions | Stateless JWT signed with HS256; configurable expiration via `jwt.expiration-ms` |
| Authorization | Role-based access control (`admin`, `cliente`) enforced both at URL level (Spring Security) and at method level (`@PreAuthorize`) |
| Input validation | Jakarta Bean Validation (`@Email`, `@NotBlank`, `@Size`, `@Pattern`) on every public DTO; rejected before reaching controllers |
| Errors | Global `@RestControllerAdvice` returns consistent JSON; internal stack traces never exposed to clients |
| CORS | Closed allow-list (Vercel production URL + local dev); no wildcards |
| SQL injection | All queries parameterised through Spring Data JPA / `@Query` named parameters |
| Secrets | All credentials (DB, OpenAI, JWT, Telegram) loaded from environment variables; `application-secrets.properties` gitignored |
| File uploads | Server-side MIME-type allow-list (`image/jpeg`, `png`, `webp`, `gif`), 5 MB max size, UUID-based filenames to prevent path traversal |
| Identifiers | UUIDs (not sequential IDs) for users, conversations and vehicles, preventing enumeration attacks |
| Anonymous chat | Conversation UUIDs act as unguessable session tokens; ownership checks enforced server-side on delete and export |

---

## Author

**Guillermo Andújar Martínez**

[Portfolio](https://guillegas-dev.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/guillermo-andújar-martínez/) · [guilleandumarti@gmail.com](mailto:guilleandumarti@gmail.com)

---

<div align="center">
<sub>Built as a final-year engineering project (TFG) · Universidad de Sevilla · 2025</sub>
</div>
