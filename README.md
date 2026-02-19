# BRDify Agent

AI-powered agent to transform unstructured business communication into structured Business Requirements Documents (BRD).

## Project Structure

- **backend/**: Spring Boot application (Java 17)
- **frontend/**: React application (Vite + TypeScript)

## Setup & Run

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL Database

### 1. Database Setup
Create a MySQL database named `brdify_db`.

### 2. Backend Setup
1.  Navigate to `backend/`.
2.  Copy `.env.example` to a new file (or set environment variables).
    - *Note: Spring Boot standard property replacement is used. You can pass these as VM arguments or system variables.*
3.  Required Environment Variables:
    - `DB_USERNAME`: Database username (default: root)
    - `DB_PASSWORD`: Database password
    - `GROQ_API_KEY`: Your Groq API Key

    **Running with Maven:**
    ```bash
    mvn spring-boot:run -Dspring-boot.run.jvmArguments="-DDB_PASSWORD=yourpassword -DGROQ_API_KEY=gsk_..."
    ```

### 3. Frontend Setup
1.  Navigate to `frontend/`.
2.  Install dependencies: `npm install`.
3.  Copy `.env.example` to `.env` and configure:
    - `VITE_API_URL`: Backend API URL (default: http://localhost:8082/api)
4.  Run the app:
    ```bash
    npm run dev
    ```

## Features
- Upload Transcripts/Emails (.txt, .pdf)
- AI Extraction of Requirements, Decisions, Stakeholders, Risks, Timeline
- Export to PDF and DOCX
