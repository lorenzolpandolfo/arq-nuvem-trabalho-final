/**
 * API layer — all communication with the backend happens here.
 *
 * Auth service:    http://localhost/api/auth/...
 * Content service: http://localhost/api/content/...
 *
 * Token is kept in module-level memory. For persistence across page reloads,
 * replace the two helpers below with localStorage reads/writes.
 */

import { API_AUTH, API_CONTENT, API_USERS } from "./constants";
import type {
  UserData,
  Post,
  ApiTokenResponse,
  ApiAuthor,
  ApiPost,
  PostResponse,
  AuthorPostsResponse,
  AuthorDataResponse,
  LikeProfileResponse,
} from "../types";

// ── Token management ──────────────────────────────────────────────────────────

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.clear();
}

function bearer(): HeadersInit {
  const token = localStorage.getItem("token");

  // console.log("Token: ", token);

  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Decode JWT payload without a library (base64url → JSON). */
function decodeJWTPayload(token: string): Record<string, unknown> {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

// ── Normalizers ───────────────────────────────────────────────────────────────

const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

// ── Generic fetch helper ──────────────────────────────────────────────────────

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Login via OAuth2 password flow.
 * Returns the normalised UserData of the authenticated user.
 */
export async function login(
  email: string,
  password: string,
): Promise<UserData> {
  // console.log("Fazendo login");
  const body = new URLSearchParams({
    grant_type: "password",
    username: email,
    password,
    scope: "",
    client_id: "",
    client_secret: "",
  });

  const tokenRes = await request<ApiTokenResponse>(`${API_AUTH}/jwt/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  // console.log(tokenRes);

  setToken(tokenRes.access_token);

  // Extract user id from JWT sub claim, then fetch full profile.
  const payload = decodeJWTPayload(tokenRes.access_token);

  // console.log("decoded payload: ", payload);

  const userId = payload.sub as string;
  localStorage.setItem("userId", userId);

  return fetchAuthorById(userId);
}

/**
 * Register a new account, then automatically log in.
 */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<UserData> {
  await request<ApiAuthor>(`${API_AUTH}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name,
      bio: null,
      image_url: DEFAULT_AVATAR,
      is_active: true,
      is_superuser: false,
      is_verified: false,
    }),
  });

  // Log in immediately to obtain the token and full profile.

  return login(email, password);
}

// ── Authors ───────────────────────────────────────────────────────────────────

export async function fetchAuthors(): Promise<UserData[]> {
  const raw = await request<ApiAuthor[]>(`${API_CONTENT}/authors`);
  // console.log("Consultando autores: ", raw);
  return raw.authors;
}

export async function fetchAuthorById(id: string): Promise<AuthorDataResponse> {
  const raw = await request<AuthorDataResponse>(
    `${API_CONTENT}/authors/author/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...bearer(),
      },
    },
  );
  // console.log("Consultando autor pelo id: ", id, raw);
  return raw;
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function fetchPosts(): Promise<Post[]> {
  const raw = await request<PostResponse>(`${API_CONTENT}/posts`);
  // console.log("posts:", raw.posts);
  return raw.posts;
}

export async function fetchPostsByAuthor(
  authorId: string,
  limit = 100,
  offset = 0,
): Promise<AuthorPostsResponse> {
  const raw = await request<AuthorPostsResponse>(
    `${API_CONTENT}/posts/author/${authorId}?limit=${limit}&offset=${offset}`,
  );

  // console.log("Posts do autor: ", raw);

  return raw;
}

export async function createPost(text: string): Promise<Post> {
  const raw = await request<ApiPost>(`${API_CONTENT}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...bearer(),
    },
    body: JSON.stringify({ description: text }),
  });
  return raw;
}

export async function likeProfile(
  userId: string,
): Promise<LikeProfileResponse> {
  // console.log("Curtindo usuario ", userId);

  const raw = await request<LikeProfileResponse>(`${API_CONTENT}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...bearer(),
    },
    body: JSON.stringify({ user_id: userId }),
  });

  return raw;
}
export interface UpdateProfilePayload {
  name: string;
  bio: string;
  image_url: string;
}

export async function updateProfile(
  data: UpdateProfilePayload,
): Promise<AuthorDataResponse> {
  const raw = await request<AuthorDataResponse>(`${API_USERS}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...bearer(),
    },
    body: JSON.stringify({
      ...data,
    }),
  });

  return raw;
}
