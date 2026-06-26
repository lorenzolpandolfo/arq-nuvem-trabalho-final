export type Screen = "auth" | "feed" | "profile" | "search";
export type AuthMode = "login" | "register";

export interface UserData {
  id: string;
  name: string;
  email: string;
  image_url: string;
  bio: string;
  baseLikes: number;
}

export interface Post {
  id: string;
  author_id: string;
  author_image_url: string;
  author_name: string;
  description: string;
  created_date: string;
}

export interface AuthorPost {
  id: string;
  author: string;
  author_image_url: string;
  description: string;
  created_at: string;
}

export interface PostResponse {
  posts: Post[];
}

export interface AuthorPostsResponse {
  posts: AuthorPost[];
}

export interface AuthorDataResponse {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  posts: number;
  likes: number;
  has_like: boolean;
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

export interface LikeProfileResponse {
  liked: boolean;
}
