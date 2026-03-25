export type Category = 'Emergency' | 'Infrastructure' | 'Community Issue' | 'Health' | 'Education' | 'Environment' | 'Innovation' | 'Other';
export type UserRole = 'REPORTER' | 'INSTITUTION';
export type StoryStatus = 'pending' | 'verified' | 'rejected' | 'handled' | 'in-progress';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  bookmarkedStories?: string[];
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  location: string;
  category: Category;
  createdAt: string;
  status: StoryStatus;
  
  // AI Generated Fields
  summary: string;
  tags: string[];
  impactScore: number;
  impactBreakdown: {
    urgency: number;
    reach: number;
    relevance: number;
  };
  verificationLevel: 'Low' | 'Medium' | 'High';
  
  // User interaction
  amplifiedCount: number;
  bookmarkedBy: string[]; // User IDs
}

export interface StorySubmission {
  title: string;
  description: string;
  location: string;
  category: Category;
  media: string[];
}
