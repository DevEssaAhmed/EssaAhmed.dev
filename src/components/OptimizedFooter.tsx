import { memo } from 'react';
import Footer from './Footer';

const OptimizedFooter = memo(() => {
  return <Footer />;
});

OptimizedFooter.displayName = 'OptimizedFooter';

export default OptimizedFooter;
