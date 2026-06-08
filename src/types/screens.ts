export interface DataList {
  id: string;
  createdAt?: string | null;
  description?: string;
  isEnabled?: boolean;
  title?: string;
  updated_At?: string | null;
  createdByName?: string;
  createdByUserId?: string;
  key?: string;
  updatedByName?: string;
  updatedByUserId?: string;
}

interface CreatedAt {
  _seconds: number;
  _nanoseconds: number;
}

export interface User {
  gender: string;
  following: string[];
  firstName: string;
  profileImage: string;
  dob: string;
  followers: string[];
  email: string;
  phoneNo: string;
  createdAt: CreatedAt;
  lastName: string;
}

export interface Comments {
  comment: string;
  createdAt: CreatedAt;
  id: string;
  user: User;
  userId: string;
  userName: string;
}

export interface Post {
  createdAt: CreatedAt;
  description: string;
  id: string;
  imageUrl: string[];
  lastLikedUser: User | null | undefined;
  likes: string[];
  title: string;
  user: User | undefined;
  userId: string;
}

export interface RenderPost {
  createdAt?: CreatedAt;
  description?: string;
  id?: string;
  imageUrl?: string[];
  likes?: string[];
  title?: string;
  userId?: string;
}

export interface RequestType {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted';

  senderData?: {
    firstName: string;
    lastName: string;
    username: string;
    profileImage: string;
  };
}

export interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string;
  followStatus?: 'none' | 'pending' | 'accepted' | 'follow_back';
}

export interface SearchUser {
  createdAt?: { _seconds: number; _nanoseconds: number };
  dob?: string;
  email?: string;
  firstName: string;
  followStatus?: 'none' | 'pending' | 'accepted' | 'follow_back';
  username: string;
  id: string;
  lastName: string;
  profileImage: string;
  followers?: string[];
  following?: string[];
  gender?: string;
  phoneNo?: string;
}
