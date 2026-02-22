# BRDify: AI-Powered BRD Generation Agent

**BRDify** is an intelligent platform designed to transform unstructured business communication—such as meeting transcripts, emails, and raw notes—into professionally structured **Business Requirements Documents (BRD)**. Leveraging advanced Large Language Models (LLMs) via the Groq API, it automates the extraction of requirements, decisions, stakeholders, risks, and timelines.

---

## Key Features

- **Multi-Source Input**: Upload `.txt`, `.pdf`, or `.docx` files, or simply paste raw text.
- **Automated Extraction**: Uses AI to identify:
  - **Functional Requirements**: Precise "The system shall..." statements.
  - **Key Decisions**: Architectural and business pivots.
  - **Stakeholders**: Roles and individuals identified from context.
  - **Risk Assessment**: Probability, impact, and mitigation strategies.
  - **Project Timeline**: Milestones and expected delivery dates.
- **Traceability Matrix (RTM)**: Automatically maps requirements back to source text segments and linked decisions/risks.
- **Interactive Editing**: Review and refine AI-generated content through a modern dashboard.
- **Professional Exports**: Generate and download BRDs in PDF and DOCX formats.

---

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.3 (Java 17)
- **Database**: MySQL
- **AI Integration**: Groq API (Models: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`)
- **Document Generation**: OpenPDF (PDF), Apache POI (DOCX)
- **Dependency Management**: Maven

### Frontend
- **Framework**: React 18 (Vite + TypeScript)
- **UI Components**: Tailwind-style custom CSS, Lucide React icons
- **API Client**: Axios
- **Routing**: React Router DOM

---

## Project Structure

```text
BRDify/
├── backend/                # Spring Boot Application
│   ├── src/main/java/      # Java Source Code
│   │   └── com/brdify/     # Controllers, Services, Repositories, Domains
│   ├── src/main/resources/ # application.properties, Static Assets
│   ├── .env                # Backend Environment Variables
│   └── pom.xml             # Maven Configuration
├── frontend/               # React Application
│   ├── src/                # Frontend Source Code (App.tsx, API layer)
│   ├── .env                # Frontend Environment Variables
│   └── package.json        # NPM Configuration
└── README.md               # Project Documentation
```

---

## Local Setup & Installation

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **MySQL Server**
- **Groq API Key** (Get it at [console.groq.com](https://console.groq.com/))

### 1. Repository Cloning
```bash
git clone https://github.com/ezManish/BRDify.git
cd BRDify
```

### 2. Database Configuration
Create a MySQL database:
```sql
CREATE DATABASE brdify_db;
```

### 3. Backend Implementation
Navigate to the `backend` directory:
```bash
cd backend
```
Create a `.env` file in the `backend` root:
```properties
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
GROQ_API_KEY=your_groq_api_key
```

**Running the Backend:**
```bash
mvn spring-boot:run
```
*The server will start at `http://localhost:8082`.*

### 4. Frontend Implementation
Navigate to the `frontend` directory:
```bash
cd ../frontend
```
Create a `.env` file in the `frontend` root:
```properties
VITE_API_URL=http://localhost:8082/api
```

**Running the Frontend:**
```bash
npm install
npm run dev
```
*The application will be accessible at `http://localhost:5173`.*

---

## Usage Flow

1. **Dashboard**: Land on the home screen and choose to upload a file or paste text.
2. **Analysis**: The backend cleans the text, chunks it, and sends it to the Groq LLM for processing.
3. **Review**: Navigate through the sidebar tabs (Requirements, Risks, etc.) to review extracted data.
4. **Refine**: Click "Edit" to modify any field manually.
5. **Finalize**: Download the professional document in your preferred format.

---
