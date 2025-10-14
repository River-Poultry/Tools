import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { User } from 'lucide-react';
import { Support, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RegistrationPromptProps {
  trigger: 'download' | 'support' | 'personalization';
  onClose?: () => void;
}

const RegistrationPrompt: React.FC<RegistrationPromptProps> = ({ trigger, onClose }) => {
  const navigate = useNavigate();

  const getContent = () => {
    switch (trigger) {
      case 'download':
        return {
          title: 'Save Your Results',
          description: 'Register to save your vaccination schedules, download PDFs, and access your history anytime.',
          benefits: [
            'Save vaccination schedules',
            'Download PDF reports',
            'Access your history',
            'Get email reminders'
          ],
          icon: <Download sx={{ fontSize: 48 }} color="primary" />,
          primaryAction: 'Register & Save',
          secondaryAction: 'Continue as Guest'
        };
      case 'support':
        return {
          title: 'Get Personalized Support',
          description: 'Register to get personalized support, expert advice, and priority assistance for your farm.',
          benefits: [
            'Personalized support',
            'Expert advice',
            'Priority assistance',
            'Direct communication'
          ],
          icon: <Support sx={{ fontSize: 48 }} color="primary" />,
          primaryAction: 'Register for Support',
          secondaryAction: 'Continue as Guest'
        };
      case 'personalization':
        return {
          title: 'Personalize Your Experience',
          description: 'Register to get personalized recommendations, save your preferences, and track your farm progress.',
          benefits: [
            'Personalized recommendations',
            'Save preferences',
            'Track progress',
            'Historical data'
          ],
          icon: <User size={48} color="primary" />,
          primaryAction: 'Register Now',
          secondaryAction: 'Continue as Guest'
        };
      default:
        return {
          title: 'Join River Poultry Tools',
          description: 'Register to unlock all features and get the most out of your poultry management.',
          benefits: [
            'Save your work',
            'Get support',
            'Track progress',
            'Access history'
          ],
          icon: <User size={48} color="primary" />,
          primaryAction: 'Register',
          secondaryAction: 'Continue as Guest'
        };
    }
  };

  const content = getContent();

  const handleRegister = () => {
    navigate('/login');
  };

  const handleContinueAsGuest = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            {content.icon}
          </Box>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            {content.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {content.description}
          </Typography>

          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Benefits of registering:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {content.benefits.map((benefit, index) => (
                <li key={index}>
                  <Typography variant="body2">{benefit}</Typography>
                </li>
              ))}
            </ul>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleRegister}
              sx={{ flex: 1 }}
            >
              {content.primaryAction}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleContinueAsGuest}
              sx={{ flex: 1 }}
            >
              {content.secondaryAction}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Registration is free and takes less than 2 minutes
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegistrationPrompt;
