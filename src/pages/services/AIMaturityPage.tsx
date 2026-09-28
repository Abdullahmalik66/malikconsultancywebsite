import ServicePageLayout from '@/components/service/ServicePageLayout';
import { aiMaturityService } from '@/content/services/aiMaturity';

export default function AIMaturityPage() {
  return <ServicePageLayout config={aiMaturityService} />;
}
