import { User } from "next-auth";

export interface ProfileData {
  user: Pick<User, "name" | "image" | "email">;
  bio: string;
  location: string;
  website: string;
  twitterHandle: string;
  githubHandle: string;
  company: string;
  jobTitle: string;
  customUrl: string;
  themeColor: string;
  bannerImage: string;
  layout: string;
  skills: string[];
  achievements: string[];
  customSections: CustomSection[];
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ProfileProps {
  profile: ProfileData;
  isEditing?: boolean;
  onEdit?: (profile: ProfileData) => void;
}
