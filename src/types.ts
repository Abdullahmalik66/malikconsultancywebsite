export interface Writing {
  id: string;
  date: string;
  category: 'Blog' | 'News' | 'Strategy';
  author?: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  badgeText?: string;
  tags?: string[];
  content?: string;
}
