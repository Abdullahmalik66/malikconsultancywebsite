import ServicePageLayout from '@/components/service/ServicePageLayout';
import { dataActivationService } from '@/content/services/dataActivation';

export default function DataActivationPage() {
  return <ServicePageLayout config={dataActivationService} />;
}
