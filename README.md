<div align="center">

# 🥁 Taiko

**AI-powered SaaS platform for small and medium businesses**

[![Java](https://img.shields.io/badge/Java_17+-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_+_pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![OpenAI](https://img.shields.io/badge/OpenAI_API-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## What is Taiko?

Taiko is a full-stack SaaS platform that gives small businesses two things: a clean interface to manage their inventory or catalog, and an AI-powered chatbot that answers customer questions in natural language — using that same inventory as its knowledge base.

The AI layer is built on **Retrieval-Augmented Generation (RAG)**: when a customer asks a question, the system converts it to a vector embedding, searches for semantically similar items in the database using `pgvector`, and feeds the relevant context to the language model to generate a grounded, accurate response.

The platform is designed to be **industry-agnostic** — the core architecture adapts to any type of catalog or inventory. The current implementation is a fully-featured car dealership demo.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      React Frontend                      │
│         (Admin dashboard + Customer chat widget)         │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API (JWT-secured)
┌───────────────────────▼─────────────────────────────────┐
│                   Spring Boot Backend                    │
│                                                          │
│  ┌─────────────────┐      ┌──────────────────────────┐  │
│  │  Business Logic │      │       RAG Engine          │  │
│  │  (Spring MVC)   │      │  Spring AI + OpenAI API   │  │
│  │  User & Roles   │      │  text-embedding-3-small   │  │
│  │  CSV Import     │      │  Semantic vector search   │  │
│  └────────┬────────┘      └────────────┬─────────────┘  │
└───────────┼────────────────────────────┼────────────────┘
            │                            │ pgvector similarity search
┌───────────▼────────────────────────────▼────────────────┐
│                     PostgreSQL + pgvector                │
│          (Inventory · Users · Chat history · Embeddings) │
└─────────────────────────────────────────────────────────┘
```

---

## Features

- **RAG Chatbot** — customers query the inventory using natural language; the AI answers based on the actual business catalog, not hallucinations
- **Inventory management** — full CRUD for catalog items with bulk CSV import
- **User & role system** — JWT authentication with admin / client roles and permission scoping
- **Conversation history** — all chat sessions are persisted and exportable for business analytics
- **Adaptable core** — swap the inventory schema to deploy Taiko for any industry

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot, Spring Security (JWT), Hibernate JPA |
| AI Engine | Spring AI, OpenAI API (`text-embedding-3-small`) |
| Vector Search | PostgreSQL + `pgvector` extension |
| Frontend | React, Tailwind CSS |
| Build | Maven |

---

## Getting Started

### Prerequisites

- Java 17+
- PostgreSQL with `pgvector` extension enabled
- OpenAI API key

### 1. Database setup

```sql
CREATE DATABASE taiko_db;
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

Configure your credentials in `backend/src/main/resources/application.properties`.

### 2. Set your OpenAI API key

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

Or add it to `.vscode/launch.json` under `env` if using VS Code.

### 3. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

API available at `http://localhost:8080`.

---

## Author

**Guillermo Andújar Martínez**
[Portfolio](https://guillegas-dev.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/guillermo-andújar-martínez/) · [guilleandumarti@gmail.com](mailto:guilleandumarti@gmail.com)
