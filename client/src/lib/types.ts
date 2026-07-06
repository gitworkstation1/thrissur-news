// client/src/lib/types.ts

export interface Article {
  _id: string;
  headline: string;
  body: string;
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
  // --- NEW: Added optional credits for reporter and photographer ---
  credits?: {
    reporter?: {
      name: string;
      avatarUrl?: string; // Optional image for the reporter
    };
    photographer?: {
      name: string;
      avatarUrl?: string; // Optional image for the photographer
    };
  };
  createdAt: string;
  updatedAt: string;
  status?: 'published' | 'draft';
}