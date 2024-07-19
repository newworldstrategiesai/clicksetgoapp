import React from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import Overview from '@/components/ui/Overview/Overview';

const OverviewPage = () => {
  return <Overview />;
};

export default ProtectedPage(OverviewPage);
