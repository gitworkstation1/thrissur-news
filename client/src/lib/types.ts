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
  createdAt: string;
  updatedAt: string;
}