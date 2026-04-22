# ApexTeamBoard

ApexTeamBoard is a modern Kanban-style task management application featuring real-time search, task CRUD operations, a commenting system, and persistent storage via SQLite. Built with a React frontend and a Node.js/Express backend, TeamBoard is designed for productivity, collaboration, and a beautiful user experience.

## Features

- Kanban board with Todo, In-Progress, and Done columns
- Real-time, debounced search for tasks
- Create, update, and delete tasks
- Commenting system for task discussions
- JWT-based authentication (register/login)
- Persistent storage with SQLite
- Modern glassmorphism UI with dark mode
- Fast, responsive, and accessible

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- React Router DOM v6
- TanStack Query v5
- Lucide React (icons)
- Vanilla CSS (glassmorphism, dark mode)

**Backend**
- Node.js + Express (TypeScript)
- SQLite (better-sqlite3)
- Zod (validation)
- JWT (authentication)
- BcryptJS (password hashing)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/TeamBoard.git
cd TeamBoard
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Seed the Database

```bash
cd apps/api
npm run seed
```
Demo user:  
**Username:** alice  
**Password:** password123

### 4. Run the Applications

- **API:**  
  ```bash
  cd apps/api
  npm run dev
  ```
  Runs on [http://localhost:4000](http://localhost:4000)

- **Web:**  
  ```bash
  cd apps/web
  npm run dev
  ```
  Runs on [http://localhost:5173](http://localhost:5173)

## API Endpoints

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive JWT
- `GET /auth/me` — Get current user info
- `GET /tasks` — List/search tasks (`?search=...&page=...&limit=...`)
- `POST /tasks` — Create a new task
- `PATCH /tasks/:id` — Update a task
- `DELETE /tasks/:id` — Delete a task
- `GET /tasks/:id/comments` — Get comments for a task
- `POST /tasks/:id/comments` — Add a comment to a task

## Screenshots

<img width="1480" height="861" alt="Screenshot 2026-04-22 at 16 57 27" src="https://github.com/user-attachments/assets/d9b1962c-97ac-4aa5-abf0-0ace2848fb12" />
Homescreen

<img width="1478" height="865" alt="Screenshot 2026-04-22 at 16 57 38" src="https://github.com/user-attachments/assets/38840318-b8bc-4e69-8af6-14f11d740b6b" />
Task Details

<img width="1477" height="864" alt="Screenshot 2026-04-22 at 16 58 13" src="https://github.com/user-attachments/assets/c5486739-8e39-4409-a2fc-f27f47ae1d2d" />
<img width="1476" height="858" alt="Screenshot 2026-04-22 at 16 58 04" src="https://github.com/user-attachments/assets/a4d7314d-a130-433a-8353-9b36a110be74" />
Add Card


## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

## License

This project is licensed under the MIT License.

---
