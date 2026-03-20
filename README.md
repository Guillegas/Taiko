# Taiko - Adaptable AI Management SaaS 🚀🤖

Taiko is a powerful and versatile Software as a Service (SaaS) platform designed to empower small to medium businesses across any industry. It provides a robust core for database management, customer interactions, and deeply integrated AI-driven automation.

**🚗 Current Implementation: Car Dealership Use Case**  
*This repository serves as a practical, fully-featured example of Taiko adapted specifically for the automotive sector (developed as my TFG - Trabajo de Fin de Grado). It demonstrates how the system's core architecture can be tailored to manage very specific inventory (like vehicles) and use AI to assist customers in finding exactly what they need based on natural language.*

## ✨ Core Platform Capabilities
- **Adaptable Database Management:** A robust backend architecture (PostgreSQL + Hibernate) ready to model, store, and serve any type of inventory, product catalog, or service portfolio.
- **AI-Powered Client Assistants (RAG):** An intelligent, conversational chatbot powered by OpenAI and vector embeddings. It understands customer natural language queries and matches them semantically with the business's specific catalog.
- **Bulk Data Import:** Quickly scalable via CSV file imports, allowing rapid context updates and deployment for new business niches.
- **User & Role Management:** Secure JWT-based authentication system with custom user profiles, permissions, and roles (Administrators, Clients, etc.).
- **Interaction Tracking:** Chat history saving and exporting. This allows businesses to seamlessly analyze customer needs, track engagements, and improve operations.

## 🛠️ Technology Stack
- **Backend Core:** Java 17+, Spring Boot, Spring Security (JWT)
- **AI Engine:** Spring AI, OpenAI API (`text-embedding-3-small` for vector calculation)
- **Database:** PostgreSQL with the `pgvector` extension (crucial for semantic similarity searches) & Hibernate JPA
- **Frontend / UI:** React (Projected)

## 🚀 How to Run Locally

### 1. Database Setup
Ensure you have PostgreSQL running locally with a database named `taiko_db`. You will need to configure your own credentials in `application.properties` and ensure the database has the `pgvector` extension enabled for the AI searches to work correctly.

### 2. Environment Variables (OpenAI API Key)
The project requires an OpenAI API key for the embedding generation and chatbot features. To run it safely without exposing your static key:
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
