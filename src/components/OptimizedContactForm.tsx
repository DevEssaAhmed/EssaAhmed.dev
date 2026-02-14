import { memo } from 'react';
import ContactForm from './ContactForm';

const OptimizedContactForm = memo(() => {
  return <ContactForm />;
});

OptimizedContactForm.displayName = 'OptimizedContactForm';

export default OptimizedContactForm;
