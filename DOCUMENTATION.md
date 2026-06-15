# TeamBoard - Technical Documentation

## Overview

TeamBoard is a modern Kanban-style task management application built as a frontend-only SPA. It features real-time search, task CRUD operations, a commenting system, and persistent browser storage via localStorage.

---

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Routing**: React Router DOM (v6)
- **Data Fetching/Caching**: TanStack Query (v5)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with focus on Glassmorphism and modern Dark Mode aesthetics.

### Backend

- **Runtime**: Browser (no server required)
- **Persistence**: localStorage
- **Authentication**: local session token + persisted user record
- **Data Access**: In-browser API shim (`apiFetch`) that emulates REST endpoints

---

## Data Architecture

### Storage Schema

Browser storage is split into three collections:

- `users`: Stores user identity and local credentials.
- `tasks`: Stores task details, current status, and timestamps.
- `comments`: Linked to tasks and users, storing discussion logs.

### Authentication Flow

1. **Register**: Creates a local user in browser storage and returns a local token.
2. **Login**: Verifies stored credentials and returns a local token.
3. **Session**: `AuthContext` persists token and user in localStorage.

### Validation & Error Handling

All incoming payloads are validated inside the in-browser data layer before writes are committed to storage.

- **Consistent Error Shape**: All errors follow the structure:
  ```json
  {
    "error": {
      "code": "BAD_REQUEST | UNAUTHORIZED | NOT_FOUND | CONFLICT",
      "message": "Human readable message",
      "details": [] // Optional validation details
    }
  }
  ```

---

## Frontend Architecture

### State Management

- **Server State**: Managed by TanStack Query for automatic caching, revalidation (on mutations), and loading state management.
- **Auth State**: Managed through a `AuthContext` and `AuthProvider` that persists tokens to `localStorage`.

### UI Components

- **Board**: The main container managing search state and column layouts.
- **Column**: Filter-specific view showing tasks in Todo, In-Progress, or Done states.
- **TaskCard**: A premium interactive card showing a summary of the task.
- **TaskModal**: A comprehensive detail view for editing tasks and managing comments.
- **AuthScreen**: Dual-purpose screen for Login and Registration.

### Aesthetics & Accessibility

- **Design**: Implemented "Glassmorphism" using `backdrop-filter` and semi-transparent layers.
- **User Experience**: Debounced search for smooth real-time filtering.
- **Accessibility**: Semantic HTML, high contrast colors (`#f8fafc` on `#0f172a`), and standard focus rings for keyboard navigation.

---

## API Reference

The frontend uses an in-browser API shim that mirrors REST-like endpoints for compatibility with React Query.

### Authentication

- `POST /auth/register`: Create a new user.
- `POST /auth/login`: Authenticate and get a token.
- `GET /auth/me`: Get current authenticated user info.

### Tasks

- `GET /tasks?search=...&page=...&limit=...`: List tasks with search and pagination.
- `POST /tasks`: Create a new task.
- `PATCH /tasks/:id`: Update task title, description, or status.
- `DELETE /tasks/:id`: Delete a task and its associated comments.

### Comments

- `GET /tasks/:id/comments`: Fetch all comments for a specific task.
- `POST /tasks/:id/comments`: Add a comment to a task.

---

## Getting Started

### 1. Seeding the Database

Demo data is seeded automatically on first load (user, tasks, comments).

**Demo User**: `alice` / `password123`

### 2. Running the Application

Run only the web application:

- **Web**: `npm run dev` in `apps/web` (Starts on port 5173)
