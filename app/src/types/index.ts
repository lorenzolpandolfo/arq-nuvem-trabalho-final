export type Screen = "auth" | "feed" | "profile" | "search";
export type AuthMode = "login" | "register";

export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  baseLikes: number;
}

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
