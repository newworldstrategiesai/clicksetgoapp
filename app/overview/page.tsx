import React from 'react';
import Overview from '@/components/ui/Overview/Overview';
import ProtectedPage from '@/components/ProtectedPage';

const OverviewPage: React.FC = () => {
  return <Overview />;
};

export default ProtectedPage(OverviewPage);
