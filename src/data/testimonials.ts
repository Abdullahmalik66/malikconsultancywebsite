export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role?: string;
  testimonial: string;
  approved: boolean;
  featured: boolean;
  createdAt: string;
  imgSrc?: string;
}

export const STATIC_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Lenard Jan Lempenauer",
    company: "Avaus oy",
    role: "Business Development & Managing Consultant",
    testimonial: "I had the opportunity to work with Abdullah on a client project where he managed performance marketing and activation. Abdullah demonstrated strong technical expertise, effectively bridging the gap between our strategic vision and the customers' needs. He is a reliable problem solver and analyst, always approaching challenges with a positive outlook.",
    approved: true,
    featured: true,
    createdAt: "2026-01-10T12:00:00Z",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
  },
  {
    id: "t2",
    name: "Naeem Sattar",
    company: "NaeemSattar Company",
    role: "Founder & Product Leader",
    testimonial: "It does not happen quite often that a resource has the exact skill set for your projects to function like a plug n play system, well Abdullah Malik is one. He is truly a solution provider. It was a great venture, working with him and a learning for myself on the digital front.",
    approved: true,
    featured: true,
    createdAt: "2026-02-15T12:00:00Z",
    imgSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
  },
  {
    id: "t3",
    name: "Samia Nouman",
    company: "Scrum Master PM",
    role: "Technical Project Manager | Scrum Master",
    testimonial: "I found Abdullah to be consistently pleasant, tackling assignments with dedication and a smile. Abdullah is a take-charge person who is able to present creative ideas and communicate the benefits. He is a great team player and would make a great asset to any organization.",
    approved: true,
    featured: false,
    createdAt: "2026-03-20T12:00:00Z",
    imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
  },
  {
    id: "t4",
    name: "Hafiz Muhammad Aleem",
    company: "OD",
    role: "Manager HR | HRBP | OD",
    testimonial: "Abdullah Malik works with dedication and commitment. He knows his work and manages his goals efficiently. Achieving success as a professional, Malik is young, energetic and self-motivated. He has a strong reputation for motivation, vision and honour.",
    approved: true,
    featured: false,
    createdAt: "2026-04-05T12:00:00Z",
    imgSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
  },
  {
    id: "t5",
    name: "Nawaz Bhutto",
    company: "Tarsil.pk",
    role: "Co-Founder | CMO",
    testimonial: "Malik is a talented and passionate digital marketer with a thirst for knowledge. It was a pleasure to work with Abdullah on different projects and I look forward to working with him again in the future.",
    approved: true,
    featured: false,
    createdAt: "2026-05-12T12:00:00Z",
    imgSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop"
  }
];

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
