import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRegisteringRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isRegisteringRef.current) return;
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const register = async (email, password) => {
    isRegisteringRef.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await signOut(auth);
      return cred;
    } finally {
      isRegisteringRef.current = false;
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
