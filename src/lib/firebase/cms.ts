import { ref as dbRef, get, set, update, push, remove, query, orderByChild, equalTo } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "./db";
import { storage } from "./storage";

export type ContentStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected';

export type TestimonialStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected' | 'archived';

export interface TestimonialItem {
  id: string;
  sourceType: 'public_submission' | 'admin';
  status: TestimonialStatus;
  name: string;
  company: string;
  role?: string;
  testimonial: string;
  companyLogoUrl?: string | null;
  avatarUrl?: string | null;
  consentGiven?: boolean;
  moderationNote?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  publishedAt?: string;
  submittedByEmail?: string;
}

export interface ContentItem {
  id: string;
  contentType: 'blog' | 'case_study' | 'testimonial' | 'text_block';
  status: ContentStatus;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  headerImage?: string | null;
  authorName?: string;
  authorBio?: string;
  authorImage?: string | null;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tags?: string[];
  category?: string;
  badgeText?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  submittedBy?: string; // e.g., 'frontend' or admin uid
  approvedBy?: string;
  linkedCardIds?: string[];
}

export interface CardItem {
  id: string;
  sourceId: string;
  sourceType: 'blog' | 'case_study' | 'testimonial' | 'text_block';
  cardType: 'standard' | 'hero' | 'minimal' | 'media_showcase' | 'quote' | 'compact' | 'case_study' | 'dual_content' | 'custom' | 'case_study_solid';
  titleOverride?: string;
  textOverride?: string;
  imageOverride?: string;
  eyebrowOverride?: string;
  section: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

/**
 * Generates a URL-friendly slug from a title.
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// --- CONTENT OPERATIONS ---

export const saveContent = async (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Promise<ContentItem> => {
  const contentRef = id ? dbRef(db, `content/${id}`) : push(dbRef(db, 'content'));
  const actualId = id || contentRef.key;
  
  if (!actualId) throw new Error("Failed to generate ID for content");

  const now = new Date().toISOString();
  
  // If we're updating, we should preserve createdAt. For simplicity in this function, we'll fetch existing if id provided.
  let createdAt = now;
  if (id) {
    const existing = await getContentById(id);
    if (existing) {
      createdAt = existing.createdAt || now;
    }
  }

  const payload: ContentItem = {
    ...item,
    id: actualId,
    createdAt,
    updatedAt: now,
    linkedCardIds: item.linkedCardIds || [],
  };

  await set(contentRef, payload);
  return payload;
};

export const updateContentStatus = async (id: string, status: ContentStatus, approvedBy?: string): Promise<void> => {
  const updates: any = {
    status,
    updatedAt: new Date().toISOString(),
  };
  
  if (status === 'published') {
    updates.publishedAt = updates.updatedAt;
  }
  if (approvedBy && status === 'approved') {
    updates.approvedBy = approvedBy;
  }

  await update(dbRef(db, `content/${id}`), updates);
};

export const normalizeTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map(t => (t ? String(t).trim() : "")).filter(Boolean);
  }
  if (typeof tags === 'object') {
    return Object.values(tags).map(t => (t ? String(t).trim() : "")).filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};

export const getContentById = async (id: string): Promise<ContentItem | null> => {
  const snapshot = await get(dbRef(db, `content/${id}`));
  if (snapshot.exists()) {
    const item = snapshot.val() as ContentItem;
    return {
      ...item,
      tags: normalizeTags(item.tags)
    };
  }
  return null;
};

export const getAllContent = async (): Promise<ContentItem[]> => {
  const snapshot = await get(dbRef(db, 'content'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const allItems = Object.values(data) as ContentItem[];
    return allItems.map(item => ({
      ...item,
      tags: normalizeTags(item.tags)
    }));
  }
  return [];
};

export const getPublishedContent = async (): Promise<ContentItem[]> => {
  const snapshot = await get(dbRef(db, 'content'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const allItems = Object.values(data) as ContentItem[];
    return allItems
      .filter(item => item.status === 'published')
      .map(item => ({
        ...item,
        tags: normalizeTags(item.tags)
      }));
  }
  return [];
};

export const deleteContent = async (id: string): Promise<void> => {
  await remove(dbRef(db, `content/${id}`));
};

// --- CARDS OPERATIONS ---

export const saveCard = async (item: Omit<CardItem, 'id' | 'createdAt'>, id?: string): Promise<CardItem> => {
  const cardRef = id ? dbRef(db, `cards/${id}`) : push(dbRef(db, 'cards'));
  const actualId = id || cardRef.key;
  
  if (!actualId) throw new Error("Failed to generate ID for card");

  const now = new Date().toISOString();
  let createdAt = now;
  if (id) {
    const existingSnap = await get(cardRef);
    if (existingSnap.exists()) {
      createdAt = existingSnap.val().createdAt || now;
    }
  }

  const payload: CardItem = {
    ...item,
    id: actualId,
    createdAt,
  };

  await set(cardRef, payload);
  return payload;
};

export const getCardsBySection = async (section: string): Promise<CardItem[]> => {
  const q = query(dbRef(db, 'cards'), orderByChild('section'), equalTo(section));
  const snapshot = await get(q);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as CardItem[];
  }
  return [];
};

export const getAllCards = async (): Promise<CardItem[]> => {
  const snapshot = await get(dbRef(db, 'cards'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as CardItem[];
  }
  return [];
};

export const deleteCard = async (id: string): Promise<void> => {
  await remove(dbRef(db, `cards/${id}`));
};

// --- STORAGE OPERATIONS ---

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * Base64 strings can also be converted to blobs before calling this if needed, 
 * but this assumes a File or Blob object.
 */
export const uploadImage = async (file: File | Blob, pathPrefix: string = 'uploads'): Promise<string> => {
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const fileRef = storageRef(storage, `${pathPrefix}/${filename}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

// --- TESTIMONIAL OPERATIONS ---

export const submitPublicTestimonial = async (item: {
  name: string;
  company: string;
  role?: string;
  testimonial: string;
  consentGiven?: boolean;
  submittedByEmail?: string;
}): Promise<void> => {
  const submissionRef = push(dbRef(db, 'testimonialSubmissions'));
  const actualId = submissionRef.key;
  if (!actualId) throw new Error("Failed to generate ID for submission");

  const now = new Date().toISOString();
  const payload = {
    ...item,
    id: actualId,
    sourceType: 'public_submission',
    status: 'pending',
    createdAt: now,
  };
  await set(submissionRef, payload);
};

export const getPublishedTestimonials = async (): Promise<TestimonialItem[]> => {
  const snapshot = await get(dbRef(db, 'testimonials'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const allItems = Object.values(data) as TestimonialItem[];
    return allItems.filter(item => item.status === 'published');
  }
  return [];
};

export const getAllTestimonials = async (): Promise<TestimonialItem[]> => {
  const snapshot = await get(dbRef(db, 'testimonials'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as TestimonialItem[];
  }
  return [];
};

export const getTestimonialSubmissions = async (): Promise<TestimonialItem[]> => {
  const snapshot = await get(dbRef(db, 'testimonialSubmissions'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as TestimonialItem[];
  }
  return [];
};

export const saveTestimonial = async (
  item: Omit<TestimonialItem, 'createdAt' | 'updatedAt'>,
  createdAt?: string
): Promise<TestimonialItem> => {
  const tRef = dbRef(db, `testimonials/${item.id}`);
  const now = new Date().toISOString();
  
  const payload: TestimonialItem = {
    ...item,
    createdAt: createdAt || now,
    updatedAt: now,
  };
  await set(tRef, payload);
  return payload;
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  await remove(dbRef(db, `testimonials/${id}`));
};

export const deleteTestimonialSubmission = async (id: string): Promise<void> => {
  await remove(dbRef(db, `testimonialSubmissions/${id}`));
};

// --- COMMENT OPERATIONS ---

export interface BlogComment {
  id: string;
  blogId: string;
  authorName: string;
  commentText: string;
  createdAt: string;
}

export const saveComment = async (blogId: string, authorName: string, commentText: string): Promise<BlogComment> => {
  const commentRef = push(dbRef(db, `blogComments/${blogId}`));
  const actualId = commentRef.key;
  if (!actualId) throw new Error("Failed to generate ID for comment");

  const now = new Date().toISOString();
  const payload: BlogComment = {
    id: actualId,
    blogId,
    authorName: authorName.trim() || 'Anonymous',
    commentText: commentText.trim(),
    createdAt: now
  };

  await set(commentRef, payload);
  return payload;
};

export const getCommentsByBlogId = async (blogId: string): Promise<BlogComment[]> => {
  const snapshot = await get(dbRef(db, `blogComments/${blogId}`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as BlogComment[];
  }
  return [];
};

// --- CLIENT SHOWCASE LOGO OPERATIONS ---

export interface ClientLogoItem {
  id: string;
  name: string;
  logoUrl: string;
  padding: string; // e.g. "p-3"
  ringIndex: number; // 0 for innermost, 1 for circle 1, 2 for circle 2, 3 for circle 3
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export const saveClientLogo = async (item: Omit<ClientLogoItem, 'id' | 'createdAt'>, id?: string): Promise<ClientLogoItem> => {
  const logoRef = id ? dbRef(db, `clientLogos/${id}`) : push(dbRef(db, 'clientLogos'));
  const actualId = id || logoRef.key;
  if (!actualId) throw new Error("Failed to generate ID for client logo");

  const now = new Date().toISOString();
  let createdAt = now;
  if (id) {
    const existingSnap = await get(logoRef);
    if (existingSnap.exists()) {
      createdAt = existingSnap.val().createdAt || now;
    }
  }

  const payload: ClientLogoItem = {
    ...item,
    id: actualId,
    createdAt,
  };

  await set(logoRef, payload);
  return payload;
};

export const getAllClientLogos = async (): Promise<ClientLogoItem[]> => {
  const snapshot = await get(dbRef(db, 'clientLogos'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as ClientLogoItem[];
  }
  return [];
};

export const deleteClientLogo = async (id: string): Promise<void> => {
  await remove(dbRef(db, `clientLogos/${id}`));
};

export interface ClientShowcaseSettings {
  title: string;
  description: string;
}

export const getClientShowcaseSettings = async (): Promise<ClientShowcaseSettings> => {
  const snapshot = await get(dbRef(db, 'settings/clientShowcase'));
  if (snapshot.exists()) {
    return snapshot.val() as ClientShowcaseSettings;
  }
  return {
    title: "Organisation I Worked With:",
    description: "A selection of organisations I’ve worked with through consulting-led engagements, contributing to growth, data, and AI-driven initiatives."
  };
};

export const saveClientShowcaseSettings = async (settings: ClientShowcaseSettings): Promise<void> => {
  await set(dbRef(db, 'settings/clientShowcase'), settings);
};

// --- CLIENT SHOWCASE 2 LOGO OPERATIONS ---

export interface ClientShowcase2LogoItem {
  id: string;
  name: string;
  logoUrl: string;
  padding: string; // e.g. "p-3"
  rowIndex: number; // 0, 1, 2 etc. representing row 1, row 2, row 3
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export const saveClientShowcase2Logo = async (item: Omit<ClientShowcase2LogoItem, 'id' | 'createdAt'>, id?: string): Promise<ClientShowcase2LogoItem> => {
  const logoRef = id ? dbRef(db, `clientShowcase2Logos/${id}`) : push(dbRef(db, 'clientShowcase2Logos'));
  const actualId = id || logoRef.key;
  if (!actualId) throw new Error("Failed to generate ID for client showcase 2 logo");

  const now = new Date().toISOString();
  let createdAt = now;
  if (id) {
    const existingSnap = await get(logoRef);
    if (existingSnap.exists()) {
      createdAt = existingSnap.val().createdAt || now;
    }
  }

  const payload: ClientShowcase2LogoItem = {
    ...item,
    id: actualId,
    createdAt,
  };

  await set(logoRef, payload);
  return payload;
};

export const getAllClientShowcase2Logos = async (): Promise<ClientShowcase2LogoItem[]> => {
  const snapshot = await get(dbRef(db, 'clientShowcase2Logos'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as ClientShowcase2LogoItem[];
  }
  return [];
};

export const deleteClientShowcase2Logo = async (id: string): Promise<void> => {
  await remove(dbRef(db, `clientShowcase2Logos/${id}`));
};

export interface ClientShowcase2Settings {
  title: string;
}

export const getClientShowcase2Settings = async (): Promise<ClientShowcase2Settings> => {
  const snapshot = await get(dbRef(db, 'settings/clientShowcase2'));
  if (snapshot.exists()) {
    return snapshot.val() as ClientShowcase2Settings;
  }
  return {
    title: "Trusted by our customers & partners"
  };
};

export const saveClientShowcase2Settings = async (settings: ClientShowcase2Settings): Promise<void> => {
  await set(dbRef(db, 'settings/clientShowcase2'), settings);
};
