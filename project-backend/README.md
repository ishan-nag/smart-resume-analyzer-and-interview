# Smart Resume Analyzer & Mock Interview Tool — Backend Module

The Backend module acts as the core **Orchestrator** for the platform. It is built entirely in **Java 17** using **Spring Boot 3**. 

Its primary responsibility is to act as a secure, stateless middleman between the React Frontend UI and the Python AI Microservice, preventing direct frontend-to-AI communication.

> **This README is the single source of truth for the Backend.** Every teammate should read their respective modules, but the team leader oversees this directory.

---

## 📑 Table of Contents
1. [Architecture & Role](#1-architecture--role)
2. [Project Structure](#2-project-structure)
3. [REST API Endpoints](#3-rest-api-endpoints)
4. [Environment & Configuration](#4-environment--configuration)
5. [How to Run Locally](#5-how-to-run-locally)
6. [Error Handling](#6-error-handling)

---

## 1. 🏗️ Architecture & Role

The backend does **not** process AI logic or store data in a database. It operates as a stateless API Gateway.

```
Frontend (React)  ──REST API (Port 8080)──►  Spring Boot Backend  ──HTTP Client──►  Python AI (Port 8000)
```

**Responsibilities:**
- Forward multipart file uploads seamlessly to the AI module.
- Forward JSON payloads (Analyses, Questions, Evaluations).
- Enable broad CORS policies so the Vite frontend (Port 3000) can communicate natively.
- Catch HTTP exceptions thrown by the Python server and format them into readable JSON responses.

---

## 2. 📂 Project Structure

```
project-backend/
├── src/main/java/com/abhi/backend/
│   ├── config/                 ← CORS & RestTemplate configurations
│   ├── controller/             ← REST endpoints exposed to the Frontend
│   ├── exception/              ← Global @ExceptionHandler for clean errors
│   └── service/                ← Logic for making HTTP requests to Python
├── src/main/resources/
│   └── application.properties  ← Server port & Python Base URL
└── pom.xml                     ← Maven dependencies
```

---

## 3. 🔌 REST API Endpoints

The backend exposes the following transparent proxy endpoints:

| Method | Endpoint | Description | Payloads / Bodies |
|---|---|---|---|
| **POST** | `/api/upload` | Upload Resume PDF | `multipart/form-data` |
| **GET** | `/api/roles` | Fetch available 28 Job Roles | None |
| **POST** | `/api/analyze` | Request Resume Analysis | JSON: `{"parsed_resume": {}, "role_ids": []}` |
| **POST** | `/api/interview/generate` | Fetch 15 Interview Questions | JSON: `{"parsed_resume": {}, "role_id": "", "interview_types": []}` |
| **POST** | `/api/interview/evaluate` | Evaluate 15 Answers | JSON: `{"role_id": "", "submitted_answers": {}}` |

---

## 4. ⚙️ Environment & Configuration

All configurations are handled inside `src/main/resources/application.properties`:

```properties
spring.application.name=backend
server.port=8080

# This is the address where your Python AI FastAPI server must be running.
ai.service.url=http://localhost:8000
```
If the Python AI module is moved to the cloud (e.g., Render), update `ai.service.url` to the new https address.

**CORS Rules:**
The `CorsConfig.java` file is globally configured to allow origins `http://localhost:3000` (React) and `http://localhost:5173` (Vite Default) for seamless local development.

---

## 5. 💻 How to Run Locally

### Requirements
- **Java JDK 17** (Ensure `JAVA_HOME` is set properly)
- **Apache Maven** (or use an IDE like IntelliJ)

### Method 1: Using the Terminal (Maven)
Navigate to the `project-backend` folder and run:
```bash
mvn spring-boot:run
```
*(The server will boot up on `http://localhost:8080`)*

### Method 2: Using IntelliJ IDEA (Recommended)
1. Open IntelliJ IDEA.
2. Select **File > Open**, and select the `project-backend` folder.
3. Allow Maven to download all dependencies.
4. Open `BackendApplication.java`.
5. Click the **Green Play Button** next to the main class.

---

## 6. 🚨 Error Handling

The backend implements a `GlobalExceptionHandler` using `@RestControllerAdvice`.
If the Python AI server goes down, or if the user uploads a corrupt PDF, the Spring Boot server will catch the exception from the `RestTemplate` and return a clean standard JSON error instead of crashing:

```json
{
  "timestamp": "2026-04-10T12:00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "AI Service is currently unreachable. Please ensure the Python server is running."
}
```
