import type { RequestHandler } from "express";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ApiError, UserDTO } from "@shared/api";

const DATA_DIR = path.resolve(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
}

type UserRecord = UserDTO & { passwordHash: string };
interface UserDb { users: UserRecord[] }

function readDb(): UserDb {
  ensureStore();
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  return JSON.parse(raw) as UserDb;
}

function writeDb(db: UserDb) {
  ensureStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2));
}

function hashPassword(pw: string): string {
  // Simple non-crypto hash for demo; replace with bcrypt/scrypt in production
  const encoder = new TextEncoder();
  const data = encoder.encode(pw);
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = (hash * 31 + data[i]) | 0;
  return `h${hash >>> 0}`;
}

export const handleRegister: RequestHandler = (req, res) => {
  const body = req.body as RegisterRequest;
  if (!body?.identifier || !body?.password || !body?.name) {
    return res.status(400).json({ error: "identifier, name and password are required" } as ApiError);
  }
  const db = readDb();
  const exists = db.users.find((u) => u.identifier.toLowerCase() === body.identifier.toLowerCase());
  if (exists) return res.status(409).json({ error: "User already exists" } as ApiError);
  const now = Date.now();
  const user: UserRecord = {
    id: randomUUID(),
    identifier: body.identifier,
    name: body.name,
    role: body.role ?? "student",
    createdAt: now,
    passwordHash: hashPassword(body.password),
  };
  db.users.push(user);
  writeDb(db);
  const { passwordHash, ...dto } = user;
  return res.status(201).json({ user: dto } as RegisterResponse);
};

export const handleLogin: RequestHandler = (req, res) => {
  const body = req.body as LoginRequest;
  if (!body?.identifier || !body?.password) {
    return res.status(400).json({ error: "identifier and password are required" } as ApiError);
  }
  const db = readDb();
  const user = db.users.find((u) => u.identifier.toLowerCase() === body.identifier.toLowerCase());
  if (!user) return res.status(404).json({ error: "No registered user with that identifier" } as ApiError);
  if (user.passwordHash !== hashPassword(body.password)) return res.status(401).json({ error: "Invalid credentials" } as ApiError);
  const { passwordHash, ...dto } = user;
  return res.json({ user: dto } as LoginResponse);
};


