# TaskFlow Royal - Team Task Manager
**Creator: MOHIT PAL**

Welcome to the Kingdom. **TaskFlow Royal** is a premium, full-stack role-based Team Task Management Web Application. It boasts a custom "Midnight Royal" aesthetic utilizing complex glassmorphism, dynamic animations, and an advanced MERN stack architecture.

---

## 👑 Theoretical Explanation: How It Works

TaskFlow Royal operates on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). The application follows a modern **Client-Server Architecture** using a RESTful API pattern.

### 1. The Frontend (React + Vite + Tailwind CSS)
The frontend serves as the visual kingdom. It is built as a Single Page Application (SPA) using React. 
- **State Management:** Uses React Context API (`AuthContext`) to track whether a user is logged in and what role (Admin/Member) they possess.
- **Routing:** Handled by `react-router-dom`. Routes are protected by an `AuthRoute` wrapper to ensure unauthenticated users are redirected to the Login page.
- **Styling:** The "Royal" aesthetic is powered by Tailwind CSS, augmented by custom configuration tokens in `tailwind.config.js` and layered utility classes in `index.css` (such as `.glass-card` and `.gold-gradient`).
- **Communication:** Axios is used via a centralized `api.js` service to intercept requests and automatically attach JWT (JSON Web Tokens) for authentication.

### 2. The Backend (Node.js + Express.js)
The backend acts as the secure vault and engine.
- **API Endpoints:** Divided into modular routes (Auth, Users, Projects, Tasks).
- **Authentication Flow:** When a user logs in, the backend verifies their hashed password using `bcryptjs` and generates a secure JWT token via `jsonwebtoken`. This token is sent to the frontend and acts as the user's "passport" for future requests.
- **Role-Based Access Control (RBAC):** Middleware like `protect` verifies the JWT token, and `authorize('Admin')` ensures that destructive actions (like banishing users or creating projects) can only be executed by administrators.

### 3. The Database (MongoDB Atlas)
A NoSQL cloud database storing the realm's data across several collections:
- **Users:** Stores credentials, roles, and status (Active/Suspended). Passwords are encrypted.
- **Projects:** Stores high-level organizational folders. Members are automatically linked here when assigned to tasks.
- **Tasks:** Contains the actual work items, linking to a specific Project ID and an assigned User ID via Mongoose relations (`ref`).

---

## 📂 Directory Structure Detailed Breakdown

The repository is divided into two distinct realms: `frontend` and `backend`.

### `/backend`
The Node.js server environment.
- **`server.js` / `index.js`**: The main entry point that connects to MongoDB and mounts the Express application routes.
- **`/src/config`**: Contains `db.js`, which manages the Mongoose connection to MongoDB Atlas.
- **`/src/controllers`**: The brain of the API. Contains the logic for processing requests (e.g., `authController.js` handles login math; `taskController.js` handles creating tasks).
- **`/src/models`**: Mongoose Schema definitions (`User.js`, `Project.js`, `Task.js`). These dictate the exact structure of your database documents.
- **`/src/routes`**: Maps HTTP methods (GET, POST, PUT, DELETE) and endpoints (`/api/tasks`) to specific Controller functions.
- **`/src/middleware`**: Code that runs *between* receiving a request and executing a controller. Includes `authMiddleware.js` (for verifying JWT tokens) and error handlers.

### `/frontend`
The Vite + React user interface environment.
- **`index.html`**: The root HTML file. The React application is injected into the `<div id="root"></div>` here.
- **`tailwind.config.js`**: The design system configuration. Contains the custom color palette (royal-gold, royal-slate) and font families (Cinzel, Outfit).
- **`/src/assets`**: **(Location for Images & Static Files)**. This directory is where you place static resources like logo PNGs, background textures, or placeholder images. *(Currently, the aesthetic relies heavily on pure CSS gradients and Lucide-React SVG icons, minimizing the need for heavy image assets)*.
- **`/src/components`**: Reusable UI blocks.
  - `/layout`: Contains `Layout.jsx` (the wrapper) and `Sidebar.jsx` (the navigation).
  - `IntroOverlay.jsx`: The "Welcome to the Kingdom" animation.
  - `SettingsModal.jsx`: The admin control panel and profile updater.
  - `Modal.jsx`: A reusable popup container.
- **`/src/pages`**: The main views of the application (`Dashboard.jsx`, `Login.jsx`, `Signup.jsx`, `Projects.jsx`, `Tasks.jsx`).
- **`/src/context`**: Contains `AuthContext.jsx`, which provides global state for user authentication.
- **`/src/services`**: Contains `api.js`, setting up the Axios instance and interceptors for backend communication.
- **`index.css`**: Global stylesheet containing base font imports, CSS resets, and custom `.glass` and animation utility classes.

---

## 🚀 Getting Started

To run the kingdom locally:

1. **Start the Database & Backend Server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *(Ensure your `.env` file contains your `MONGO_URI` and `JWT_SECRET`)*

2. **Start the Frontend Interface:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open your browser to the local Vite URL (usually `http://localhost:5173`). Log in as an Admin to access the full Royal TaskFlow experience!
