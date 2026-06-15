export interface User {
  id: string;
  username: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  userId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

const USERS_KEY = "teamboard_users";
const TASKS_KEY = "teamboard_tasks";
const COMMENTS_KEY = "teamboard_comments";

type RegisterLoginBody = {
  username: string;
  password: string;
};

type StoredUser = User & {
  password: string;
};

type ApiRequestOptions = {
  method?: string;
  body?: string;
};

const readJson = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

const id = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const ensureSeedData = () => {
  const users = readJson<StoredUser[]>(USERS_KEY, []);
  if (users.length > 0) return;

  const demoUser: StoredUser = {
    id: "u-demo",
    username: "alice",
    password: "password123",
  };

  const seededTasks: Task[] = [
    {
      id: "1",
      title: "Set up Vercel deployment",
      description:
        "Configure static hosting and verify client-side routing fallback.",
      status: "done",
      userId: demoUser.id,
      createdAt: nowIso(),
    },
    {
      id: "2",
      title: "Create local auth store",
      description: "Use localStorage for session and user persistence.",
      status: "in-progress",
      userId: demoUser.id,
      createdAt: nowIso(),
    },
    {
      id: "3",
      title: "Add offline comment history",
      description: "Persist discussion logs per task in browser storage.",
      status: "todo",
      userId: demoUser.id,
      createdAt: nowIso(),
    },
  ];

  const seededComments: Comment[] = [
    {
      id: "c1",
      taskId: "1",
      userId: demoUser.id,
      username: demoUser.username,
      text: "Static deploy baseline validated.",
      createdAt: nowIso(),
    },
    {
      id: "c2",
      taskId: "2",
      userId: demoUser.id,
      username: demoUser.username,
      text: "Session token now stored locally.",
      createdAt: nowIso(),
    },
  ];

  writeJson(USERS_KEY, [demoUser]);
  writeJson(TASKS_KEY, seededTasks);
  writeJson(COMMENTS_KEY, seededComments);
};

const getSessionUser = (): User | null => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  if (!token || !userRaw) return null;
  try {
    return JSON.parse(userRaw) as User;
  } catch {
    return null;
  }
};

const parseBody = <T>(body: unknown): T => {
  if (typeof body !== "string") {
    throw new Error("Invalid request body");
  }
  return JSON.parse(body) as T;
};

const assertAuth = () => {
  const user = getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};

export const apiFetch = async (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<any> => {
  ensureSeedData();

  const method = (options.method ?? "GET").toUpperCase();
  const url = new URL(endpoint, "http://local.app");
  const path = url.pathname;

  if (path === "/auth/register" && method === "POST") {
    const body = parseBody<RegisterLoginBody>(options.body);
    const username = body.username.trim();
    const password = body.password;

    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const users = readJson<StoredUser[]>(USERS_KEY, []);
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username already exists");
    }

    const newUser: StoredUser = {
      id: id(),
      username,
      password,
    };
    users.push(newUser);
    writeJson(USERS_KEY, users);

    const token = `local-${newUser.id}`;
    return { token, user: { id: newUser.id, username: newUser.username } };
  }

  if (path === "/auth/login" && method === "POST") {
    const body = parseBody<RegisterLoginBody>(options.body);
    const username = body.username.trim();
    const users = readJson<StoredUser[]>(USERS_KEY, []);
    const matched = users.find((u) => u.username === username);

    if (!matched || matched.password !== body.password) {
      throw new Error("Invalid credentials");
    }

    const token = `local-${matched.id}`;
    return { token, user: { id: matched.id, username: matched.username } };
  }

  if (path === "/auth/me" && method === "GET") {
    const user = assertAuth();
    return { user };
  }

  if (path === "/tasks" && method === "GET") {
    const user = assertAuth();
    const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
    const tasks = readJson<Task[]>(TASKS_KEY, [])
      .filter((task) => task.userId === user.id)
      .filter((task) => {
        if (!search) return true;
        return (
          task.title.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { tasks };
  }

  if (path === "/tasks" && method === "POST") {
    const user = assertAuth();
    const payload = parseBody<Partial<Pick<Task, "title" | "status">>>(options.body);

    const newTask: Task = {
      id: id(),
      title: payload.title?.trim() || "New Task",
      description: "",
      status: payload.status === "in-progress" || payload.status === "done" ? payload.status : "todo",
      userId: user.id,
      createdAt: nowIso(),
    };

    const tasks = readJson<Task[]>(TASKS_KEY, []);
    tasks.push(newTask);
    writeJson(TASKS_KEY, tasks);
    return newTask;
  }

  const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (taskMatch && method === "PATCH") {
    const user = assertAuth();
    const taskId = taskMatch[1];
    const updates = parseBody<Partial<Pick<Task, "title" | "description" | "status">>>(options.body);

    const tasks = readJson<Task[]>(TASKS_KEY, []);
    const index = tasks.findIndex((task) => task.id === taskId && task.userId === user.id);
    if (index === -1) {
      throw new Error("Task not found");
    }

    const current = tasks[index];
    tasks[index] = {
      ...current,
      title: updates.title !== undefined ? updates.title : current.title,
      description: updates.description !== undefined ? updates.description : current.description,
      status:
        updates.status === "todo" || updates.status === "in-progress" || updates.status === "done"
          ? updates.status
          : current.status,
    };

    writeJson(TASKS_KEY, tasks);
    return tasks[index];
  }

  if (taskMatch && method === "DELETE") {
    const user = assertAuth();
    const taskId = taskMatch[1];

    const tasks = readJson<Task[]>(TASKS_KEY, []);
    const hasTask = tasks.some((task) => task.id === taskId && task.userId === user.id);
    if (!hasTask) {
      throw new Error("Task not found");
    }

    writeJson(
      TASKS_KEY,
      tasks.filter((task) => !(task.id === taskId && task.userId === user.id)),
    );

    const comments = readJson<Comment[]>(COMMENTS_KEY, []);
    writeJson(
      COMMENTS_KEY,
      comments.filter((comment) => comment.taskId !== taskId),
    );

    return null;
  }

  const commentsMatch = path.match(/^\/tasks\/([^/]+)\/comments$/);
  if (commentsMatch && method === "GET") {
    const user = assertAuth();
    const taskId = commentsMatch[1];
    const tasks = readJson<Task[]>(TASKS_KEY, []);
    const hasTask = tasks.some((task) => task.id === taskId && task.userId === user.id);
    if (!hasTask) {
      throw new Error("Task not found");
    }

    const comments = readJson<Comment[]>(COMMENTS_KEY, [])
      .filter((comment) => comment.taskId === taskId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return { comments };
  }

  if (commentsMatch && method === "POST") {
    const user = assertAuth();
    const taskId = commentsMatch[1];
    const payload = parseBody<{ text: string }>(options.body);
    const text = payload.text.trim();
    if (!text) {
      throw new Error("Comment text is required");
    }

    const tasks = readJson<Task[]>(TASKS_KEY, []);
    const hasTask = tasks.some((task) => task.id === taskId && task.userId === user.id);
    if (!hasTask) {
      throw new Error("Task not found");
    }

    const comments = readJson<Comment[]>(COMMENTS_KEY, []);
    const comment: Comment = {
      id: id(),
      taskId,
      userId: user.id,
      username: user.username,
      text,
      createdAt: nowIso(),
    };
    comments.push(comment);
    writeJson(COMMENTS_KEY, comments);
    return comment;
  }

  throw new Error(`Unsupported route: ${method} ${path}`);
};
