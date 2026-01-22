import { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    return signOut(auth);
  };
  
  // This is for the demo mode login from the previous task. 
  // We will keep it for now, as it might be useful for testing.
  const demoLogin = () => {
    const demoUser = {
      uid: 'demouser',
      displayName: 'Demo User',
      email: 'demo@example.com',
    };
    setUser(demoUser);
    setLoading(false);
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    logout,
    demoLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}