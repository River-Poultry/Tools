import { useEffect, useRef } from 'react';
import { emailNotificationService } from '../services/notificationService';

interface UseEmailNotificationProps {
  email: string;
  name?: string;
  phone?: string;
  enabled?: boolean;
}

export const useEmailNotification = ({ 
  email, 
  name, 
  phone, 
  enabled = true 
}: UseEmailNotificationProps) => {
  const hasNotifiedRef = useRef(false);
  const previousEmailRef = useRef<string>('');

  useEffect(() => {
    if (!enabled || !email || hasNotifiedRef.current) {
      return;
    }

    // Check if this is a new email (user just provided it)
    const isNewEmail = previousEmailRef.current === '' && email !== '';
    
    if (isNewEmail) {
      // Send welcome notification
      emailNotificationService.sendWelcomeNotification(email, name || phone);
      hasNotifiedRef.current = true;
    }

    // Update the previous email reference
    previousEmailRef.current = email;
  }, [email, name, phone, enabled]);

  // Reset notification flag when email changes to empty (user cleared it)
  useEffect(() => {
    if (email === '') {
      hasNotifiedRef.current = false;
      previousEmailRef.current = '';
    }
  }, [email]);

  return {
    hasNotified: hasNotifiedRef.current
  };
};
