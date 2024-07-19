import dynamic from 'next/dynamic';
import ProtectedPage from '@/components/ProtectedPage';

const Overview = dynamic(() => import('@/components/ui/Overview/Overview'), { ssr: false });

const OverviewPage = () => {
  return <Overview />;
};

export default ProtectedPage(OverviewPage);
