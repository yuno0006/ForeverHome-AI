"use client";

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserDocument, UserRole } from "@/types/user";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle as loginWithGoogleFn,
  logoutUser,
  fetchUserDocument,
} from "@/lib/auth";

export interface AuthContextValue {
  user: User | null;
  userDoc: UserDocument | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserDocument | null>;
  loginWithGoogle: () => Promise<UserDocument | null>;
  register: (
    email: string,
    password: string,
    role: UserRole,
    displayName: string
  ) => Promise<UserDocument | null>;
  refreshUserDoc: () => Promise<UserDocument | null>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const doc = await fetchUserDocument(firebaseUser.uid);
          setUserDoc(doc);
        } catch (error) {
          console.error("Failed to fetch user document:", error);
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<UserDocument | null> => {
      const credential = await loginWithEmail(email, password);
      const doc = await fetchUserDocument(credential.user.uid);
      setUser(credential.user);
      setUserDoc(doc);
      return doc;
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<UserDocument | null> => {
    const credential = await loginWithGoogleFn();
    const doc = await fetchUserDocument(credential.user.uid);
    setUser(credential.user);
    setUserDoc(doc);
    return doc;
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      role: UserRole,
      displayName: string
    ): Promise<UserDocument | null> => {
      const credential = await registerWithEmail(
        email,
        password,
        role,
        displayName
      );
      const doc = await fetchUserDocument(credential.user.uid);
      setUser(credential.user);
      setUserDoc(doc);
      return doc;
    },
    []
  );

  const refreshUserDoc = useCallback(async (): Promise<UserDocument | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setUserDoc(null);
      return null;
    }
    const doc = await fetchUserDocument(currentUser.uid);
    setUserDoc(doc);
    return doc;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setUserDoc(null);
  }, []);

  const role: UserRole | null = userDoc?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        role,
        loading,
        login,
        loginWithGoogle,
        register,
        refreshUserDoc,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
