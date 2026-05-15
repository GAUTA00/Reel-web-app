// src/types/user.types.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  followers: UserSummary[];
  following: UserSummary[];
}

// Lighter version used inside follower/following arrays
export interface UserSummary {
  _id: string;
  name: string;
  image?: string;
}
