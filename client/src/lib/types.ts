// client/src/lib/types.ts

export interface Article {
  _id: string;
  headline: string;
  body: string;
  quickSummary?: string;
  isBreaking: boolean;
  category: string;
  location: {
    ward: string;
    landmark?: string;
  };
  media: Array<{
    type: string;
    url: string;
  }>;
  credits?: {
    reporter?: {
      name: string;
      avatarUrl?: string; 
    };
    photographer?: {
      name: string;
      avatarUrl?: string; 
    };
  };
  createdAt: string;
  updatedAt: string;
  status?: 'published' | 'draft';
  keyPoints?: string[];
}