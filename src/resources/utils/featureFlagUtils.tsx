import { useNavigate } from 'react-router';

export const rerouteIfNotConfetti = () => {
  const navigate = useNavigate();
  if (window.featureFlags.displayConfettiPackage === false) {
    navigate('/not-found');
  }
};
