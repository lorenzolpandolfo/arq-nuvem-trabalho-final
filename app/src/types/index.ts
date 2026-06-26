export type Screen = "auth" | "feed" | "profile" | "search";
export type AuthMode = "login" | "register";

/** Shape used throughout the UI */
export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  baseLikes: number;
}

/** Shape used throughout the UI */
export interface Post {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface AuthForm {
  name: string;
  email: string;
  password: string;
}

// ── Raw API shapes ────────────────────────────────────────────────────────────

export interface ApiTokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiAuthor {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  image_url: string | null;
}

export interface ApiPost {
  id: string;
  description: string;
  author_id: string;
  created_at: string;
}
