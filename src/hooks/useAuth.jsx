import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLocalStorage } from '@/hooks/useLocalStorage.js';
import * as authActions from '@/hooks/auth/authActions.js';
import * as userProfileActions from '@/hooks/auth/userProfileActions.js';
import * as adminActions from '@/hooks/auth/adminActions.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useLocalStorage('rememberMe', false);

  const fetchUserProfile = useCallback(userProfileActions.fetchUserProfile, []);

  const handleAuthTimeout = useCallback(() => {
    console.warn('Authentication check timed out, proceeding without user');
    setLoading(false);
    setUser(null);
  }, []);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const checkSession = async () => {
      try {
        setLoading(true);
        
        timeoutId = setTimeout(handleAuthTimeout, 10000);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          try {
            const profile = await fetchUserProfile(session.user);
            if (isMounted) {
              if (profile && profile.status === 'active') {
                setUser(profile);
              } else {
                setUser(null);
                if (profile && profile.status === 'soft_deleted') {
                  await supabase.auth.signOut();
                }
              }
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            if (isMounted) {
              setUser(null);
            }
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      try {
        const currentUser = session?.user;
        if (currentUser) {
          const profile = await fetchUserProfile(currentUser);
          if (isMounted) {
            if (profile && profile.status === 'active') {
              setUser(profile);
            } else {
              setUser(null);
              if (profile && profile.status === 'soft_deleted') {
                await supabase.auth.signOut();
              }
            }
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (isMounted) {
          setUser(null);
        }
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile, handleAuthTimeout]);
  
  const value = {
    user,
    loading,
    login: (email, password) => authActions.login(email, password, setLoading, setUser, setRememberMe),
    logout: () => authActions.logout(setLoading, setUser, setRememberMe),
    signUp: authActions.signUp,
    sendPasswordResetEmail: (email) => authActions.sendPasswordResetEmail(email, setLoading),
    updatePassword: (newPassword) => authActions.updatePassword(newPassword, setLoading),
    
    fetchUserProfile, 

    createUserByAdmin: (formData) => adminActions.createUserByAdmin(formData, user),
    softDeleteUser: (userId) => adminActions.softDeleteUser(userId, user),
    permanentlyDeleteUser: (userId) => adminActions.permanentlyDeleteUser(userId, user),
    restoreUser: (userId) => adminActions.restoreUser(userId, user),
    updateUserByAdmin: (userIdToUpdate, formData) => adminActions.updateUserByAdmin(userIdToUpdate, formData, user),
    updateUserEmailByAdmin: (userIdToUpdate, newEmail) => adminActions.updateUserEmailByAdmin(userIdToUpdate, newEmail, user),
    
    rememberMe,
    setRememberMe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};