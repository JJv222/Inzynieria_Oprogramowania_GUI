// hooks/useAuth.ts
import { useState } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always true for this example

  return { isAuthenticated };
};

export default useAuth;
