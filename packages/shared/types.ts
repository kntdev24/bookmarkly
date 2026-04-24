export type BookmarkStatus = 'unread' | 'read' | 'archived';
export type ContentType = 'article' | 'news' | 'book' | 'product' | 'memo' | 'other';

export type Bookmark = {
  id: string;
  user_id: string | null;
  url: string | null;
  title: string | null;
  memo: string | null;
  tags: string[];
  status: BookmarkStatus;
  content_type: ContentType;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateBookmarkInput = {
  url?: string | null;
  title?: string | null;
  memo?: string | null;
  tags?: string[];
  thumbnail_url?: string | null;
};

export type UpdateBookmarkInput = {
  title?: string | null;
  memo?: string | null;
  tags?: string[];
  status?: BookmarkStatus;
};

export type OgpInfo = {
  title: string | null;
  thumbnail_url: string | null;
  domain: string | null;
};
