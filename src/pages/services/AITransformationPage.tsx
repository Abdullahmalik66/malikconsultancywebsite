import ServicePageLayout from '@/components/service/ServicePageLayout';
import { aiTransformationService } from '@/content/services/aiTransformation';

export default function AITransformationPage() {
  return <ServicePageLayout config={aiTransformationService} />;
}
