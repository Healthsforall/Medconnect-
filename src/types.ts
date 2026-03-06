export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  country: string;
  city: string;
  businessType: string;
  phone?: string;
  facebook?: string;
  isFriend?: boolean;
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  likes: number;
};
