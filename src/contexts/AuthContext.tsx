"use client";

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { UserDocument, UserRole } from "@/types/user";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle as loginWithGoogleFn,
  getGoogleRedirectResult,
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

  // Consume pending Google redirect result on mount (Brave / ad-blocker fallback)
  useEffect(() => {
    getGoogleRedirectResult().catch((err) => {
      console.error("Failed to process Google redirect result:", err);
    });
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const doc = await fetchUserDocument(firebaseUser.uid);
          if (doc) {
            setUserDoc(doc);
          } else {
            // No Firestore doc yet (new user or empty DB) — synthesize from auth
            console.log("No Firestore user doc found, synthesizing from auth");
            setUserDoc({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "User",
              photoURL: firebaseUser.photoURL || null,
              role: "adopter",
              onboardingComplete: false,
              shelterId: null,
              profile: null,
              createdAt: Timestamp.now(),
            });
          }
        } catch (error) {
          console.error("Failed to fetch user document, synthesizing from auth:", error);
          // Firestore unreachable — synthesize a doc so app knows user needs onboarding
          setUserDoc({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "User",
            photoURL: firebaseUser.photoURL || null,
            role: "adopter",
            onboardingComplete: false,
            shelterId: null,
            profile: null,
            createdAt: Timestamp.now(),
          });
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
    try {
      const doc = await fetchUserDocument(credential.user.uid);
      if (doc) {
        setUser(credential.user);
        setUserDoc(doc);
        return doc;
      }
    } catch (err) {
      console.warn("Firestore fetch after Google login failed, synthesizing doc:", err);
    }
    // Fallback: synthesize a doc so onboarding still triggers
    const syntheticDoc: UserDocument = {
      uid: credential.user.uid,
      email: credential.user.email || "",
      displayName: credential.user.displayName || "User",
      photoURL: credential.user.photoURL || null,
      role: "adopter",
      onboardingComplete: false,
      shelterId: null,
      profile: null,
      createdAt: Timestamp.now(),
    };
    setUser(credential.user);
    setUserDoc(syntheticDoc);
    return syntheticDoc;
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
