# Taiko - Car Dealership SaaS & AI Assistant 🚗🤖

Taiko is a modern car dealership Software as a Service (SaaS) project developed as a TFG (Trabajo de Fin de Grado). It integrates a robust traditional dealership management system with advanced AI capabilities, including a RAG (Retrieval-Augmented Generation) system for an intelligent vehicle search chatbot.

## ✨ Features
- **AI-Powered Chatbot (RAG):** Intelligent assistant that uses OpenAI and vector search (Embeddings) to understand user needs and recommend vehicles based on their natural language queries.
- **Vehicle Management:** Full capability to manage cars, including body types (carrocería), fuel types (combustible), environmental tags (etiqueta ambiental), and image handling.
- **CSV Data Import:** Bulk import capabilities for vehicle data through CSV files.
- **User Profiles & Authentication:** Secure JWT-based authentication system with custom user profiles.
- **Chat History Export:** Ability to save and export user conversations with the AI.

## 🛠️ Technology Stack
- **Backend:** Java, Spring Boot, Spring AI, Spring Security (JWT)
- **Database:** PostgreSQL (with `pgvector` for embedding similarity searches) & Hibernate JPA
- **AI Integration:** OpenAI API (`text-embedding-3-small` for vector calculation)
- **Frontend / UI:** React (Projected)

## 🚀 How to Run Locally

### 1. Database Setup
Ensure you have PostgreSQL running locally with a database named `taiko_db`. You will need to configure the credentials in `application.properties` and ensure the database has the `pgvector` extension enabled for the AI searches to work correctly.

### 2. Environment Variables (OpenAI API Key)
The project requires an OpenAI API key for the embedding generation and chatbot features. To run it safely without exposing your key:
- **VS Code:** Add your key in the `.vscode/launch.json` file inside the `env` object:
  ```json
  "env": {
      "OPENAI_API_KEY": "sk-your-openai-key-here"
  }
  ```
- **Terminal:** `export OPENAI_API_KEY="sk-your-openai-key-here"`

### 3. Running the Backend
Navigate to the backend folder and use the Maven wrapper:
```bash
cd backend
./mvnw spring-boot:run
```
The backend API will start on `http://localhost:8080`.

## 👨‍💻 Author
**Guillermo Andújar Martínez**
- 🔗 [LinkedIn](https://www.linkedin.com/in/guillermo-and%C3%BAjar-mart%C3%ADnez/?locale=en-US)
