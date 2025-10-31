  # Forge – Project & Task Management Backend

  A complete **Kanban-style Project & Task Management System** built with Node.js, Express, MongoDB, Socket.IO, and Gemini AI for project summaries and Q&A.

  ---

  ## 🧠 Tech Stack

  - **Node.js + Express** – REST API
  - **MongoDB + Mongoose** – Data modeling
  - **Socket.IO** – Real-time project updates (`project:{projectId}` rooms)
  - **Gemini (Google Generative AI)** – Project summarization & Q&A
  - **JWT Auth + Bcrypt** – User authentication
  - **dotenv, cors, express-rate-limit** – Utilities & security

  ---

  ## 📂 Folder Structure

  ```
  Backend/
  ├─ models/
  ├─ controllers/
  ├─ routes/
  ├─ services/
  ├─ socketjs/
  ├─ middleware/
  └─ index.js
  ```

  ---

  ## ⚙️ Setup

  ```bash
  npm install
  cp .env.example .env
  ```

  **.env Example**
  ```ini
  PORT=2001
  MONGO_URI=mongodb://localhost:27017/forge

  SECRET_KEY=your_jwt_secret

  GEMINI_API_KEY=your_gemini_key
  GEMINI_MODEL_SUMMARY=gemini-1.5-flash
  GEMINI_MODEL_QA=gemini-1.5-flash

  AI_RATE_LIMIT_WINDOW_MS=60000
  AI_RATE_LIMIT_MAX=15
  ```

  Run:
  ```bash
  npm start
  ```

  **Base URL**
  ```
  http://localhost:2001/forge
  ```

  ---

  ## 🩺 Health Check

  **GET** `/forge/healthz`
  ```json
  { "ok": true }
  ```

  ---

  ## 👤 Authentication

  ### Register
  **POST** `/forge/auth/register`
  ```json
  { "name": "alice", "password": "12345" }
  ```
  **Response**
  ```json
  { "error": false, "message": "Registered", "user": { "id": "...", "name": "alice" }, "token": "..." }
  ```

  ### Login
  **POST** `/forge/auth/login`
  ```json
  { "name": "alice", "password": "12345" }
  ```
  **Response**
  ```json
  { "error": false, "message": "Logged in", "token": "..." }
  ```

  ### Logout
  **POST** `/forge/auth/logout`
  (Requires JWT in header)
  ```json
  { "error": false, "message": "Logged out (discard token on client)" }
  ```

  ---

  ## 📁 Projects

  ### Create Project
  **POST** `/forge/projects`
  ```json
  { "name": "Website Revamp", "description": "Redesigning backend APIs" }
  ```
  **Response**
  ```json
  { "error": false, "message": "Project created.", "projectId": "...", "project": { "...": "..." } }
  ```

  ### Get All Projects (user-specific)
  **GET** `/forge/projects`
  ```json
  { "error": false, "message": [ { "_id": "...", "name": "Website Revamp" } ] }
  ```

  ### Get Project by ID
  **GET** `/forge/projects/:id`

  ### Update Project
  **PATCH** `/forge/projects/:id`
  ```json
  { "name": "Updated Name", "description": "Updated details" }
  ```

  ### Delete Project
  **DELETE** `/forge/projects/:id`

  ---

  ## 📊 Columns

  ### Get Columns by Project
  **GET** `/forge/column/:id/columns`
  ```json
  {
    "error": false,
    "columns": [
      { "key": "todo", "name": "To Do", "order": 1000 },
      { "key": "in_progress", "name": "In Progress", "order": 2000 },
      { "key": "done", "name": "Done", "order": 3000 }
    ]
  }
  ```

  ---

  ## ✅ Tasks

  ### Create Task
  **POST** `/forge/tasks`
  ```json
  {
    "projectId": "68f55e9484588233bcdef677",
    "columnId": "68f55e9484588233bcdef67a",
    "title": "Setup CI pipeline",
    "description": "Add Jenkins config",
    "difficulty": "medium",
    "user": { "userId": "68f5600e84588233bcdef6a1" }
  }
  ```
  **Response**
  ```json
  { "error": false, "message": "Task created.", "task": { "_id": "...", "title": "Setup CI pipeline" } }
  ```

  ### Get Tasks by Project
  **GET** `/forge/projects/:id/tasks`
  Supports: `?columnId=`, `?search=`, `?page=`, `?limit=`

  ### Update Task
  **PATCH** `/forge/tasks/:taskId`
  ```json
  { "title": "Setup CI/CD", "difficulty": "hard" }
  ```

  ### Delete Task
  **DELETE** `/forge/tasks/:taskId`

  ---

  ## 🤝 Members

  ### List Members
  **GET** `/forge/projects/:id/members`

  ### Add Member (owner only)
  **POST** `/forge/projects/:id/members`
  ```json
  { "userId": "68f5608a84588233bcdef6b2", "role": "member" }
  ```

  ### Update Role (owner only)
  **PATCH** `/forge/projects/:id/members/:userId`
  ```json
  { "role": "owner" }
  ```

  ### Remove Member (owner only)
  **DELETE** `/forge/projects/:id/members/:userId`

  ---

  ## 🤖 Gemini AI

  ### Summarize Project
  **POST** `/forge/ai/summarize`
  ```json
  { "projectId": "68f55e9484588233bcdef677" }
  ```
  **Response**
  ```json
  { "error": false, "text": "Project has 3 tasks. 1 pending, 1 in progress, 1 completed..." }
  ```
  Socket Event: `project:summary:ready`

  ### Ask (Project/Task)
  **POST** `/forge/ai/ask`
  ```json
  { "projectId": "68f55e9484588233bcdef677", "question": "What are the main risks?" }
  ```
  **Response**
  ```json
  { "error": false, "text": "Main risks: pipeline setup delay. Next steps: finalize build." }
  ```

  ---

  ## 🔥 Realtime (Socket.IO)

  | Event | Description |
  |--------|--------------|
  | `task:created` | Task added |
  | `task:updated` | Task updated |
  | `task:reordered` | Task moved between columns |
  | `task:deleted` | Task removed |
  | `project:summary:ready` | Gemini summary ready |

  **Join project room:**
  ```js
  socket.emit("join:project", { projectId });
  ```

  ---

  ## 🧾 Error Format

  **Failure**
  ```json
  { "error": true, "message": "Reason here" }
  ```

  **Success**
  ```json
  { "error": false, "message": "Done", "data": { "...": "..." } }
  ```

  ---

  ## 💡 cURL Cheatsheet

  **Register**
  ```bash
  curl -X POST http://localhost:2001/forge/auth/register   -H "Content-Type: application/json"   -d '{"name":"alice","password":"12345"}'
  ```

  **Login**
  ```bash
  curl -X POST http://localhost:2001/forge/auth/login   -H "Content-Type: application/json"   -d '{"name":"alice","password":"12345"}'
  ```

  **Create Project**
  ```bash
  curl -X POST http://localhost:2001/forge/projects   -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json"   -d '{"name":"Website Revamp","description":"Backend optimization"}'
  ```

  **Create Task**
  ```bash
  curl -X POST http://localhost:2001/forge/tasks   -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json"   -d '{"projectId":"68f55e9484588233bcdef677","columnId":"68f55e9484588233bcdef67a","title":"Setup CI pipeline"}'
  ```

  **Gemini Ask**
  ```bash
  curl -X POST http://localhost:2001/forge/ai/ask   -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json"   -d '{"projectId":"68f55e9484588233bcdef677","question":"What should I do next?"}'
  ```

  ---

  Built with ❤️ by the Forge Team
