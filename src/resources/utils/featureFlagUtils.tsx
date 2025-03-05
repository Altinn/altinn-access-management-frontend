import { useNavigate } from 'react-router';

export const rerouteIfNotConfetti = () => {
  const navigate = useNavigate();
  if (window.featureFlags.confettiPackage === false) {
    navigate('/not-found');
  }
};
