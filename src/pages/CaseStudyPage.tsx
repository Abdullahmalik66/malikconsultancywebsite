import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublishedContent, ContentItem } from '../lib/firebase/cms';
import ExecutiveLayout from '../components/ExecutiveLayout';
import { motion } from 'motion/react';

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchStudy = async () => {
      setLoading(true);
      try {
        const published = await getPublishedContent();
        const found = published.find(item => item.contentType === 'case_study' && item.slug === slug);
        if (found) {
          setStudy(found);
        } else {
          // If we couldn't find by slug, maybe the id was passed instead
          const foundById = published.find(item => item.contentType === 'case_study' && item.id === slug);
          if (foundById) setStudy(foundById);
        }
      } catch (error) {
        console.error("Error fetching case study:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaff] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#6d55a7]/30 border-t-[#6d55a7] rounded-full"
        />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-[#fdfaff] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-display font-medium text-[#1a1a1a] mb-4">Case Study not found</h2>
        <p className="text-[#1a1a1a]/60 mb-8">The case study you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/case-work')}
          className="px-8 py-4 bg-[#1a1a1a] text-white rounded-full font-bold uppercase tracking-widest text-xs"
        >
          Back to all work
        </button>
      </div>
    );
  }

  return (
    <ExecutiveLayout
      category={study.category || "Case Work"}
      date={study.createdAt ? new Date(study.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '.') : ''}
      title={study.title || 'Untitled'}
      slug={study.slug || study.id}
      image={study.headerImage || undefined}
      tags={study.tags || []}
      content={<div dangerouslySetInnerHTML={{ __html: study.content || '' }} />}
      linkedCardIds={study.linkedCardIds}
      authorName={study.authorName || 'Abdullah Malik'}
      authorBio={study.authorBio || 'Driving AI Transformation ┊ Agentic AI Use Case Pioneer ┊ Leadership in Scalable Innovation'}
      authorImage={study.authorImage || '/images/472164386_10170748401095387_7067836675242530090_n.jpg'}
    />
  );
}
