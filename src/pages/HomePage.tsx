import Hero from '@/components/sections/Hero';
import ValueStatement from '@/components/sections/ValueStatement';
import WorkedWithSection from '@/components/sections/WorkedWithSection';
import ServicesTabs from '@/components/sections/ServicesTabs';
import CaseWork from '@/components/sections/CaseWork';
import LatestInsights from '@/components/sections/LatestInsights';
import StaggerTestimonials from '@/components/sections/StaggerTestimonials';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueStatement />
      <WorkedWithSection />
      <ServicesTabs />
      <CaseWork />
      <LatestInsights />
      <StaggerTestimonials />
    </>
  );
}
