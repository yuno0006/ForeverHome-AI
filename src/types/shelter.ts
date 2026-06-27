import { Timestamp } from "firebase/firestore";

export interface Shelter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminUid: string;
  createdAt: Timestamp;
  logoUrl: string | null;
}

export interface StaffInvitation {
  id: string;
  email: string;
  role: "admin" | "staff";
  invitedBy: string;
  shelterId: string;
  createdAt: Timestamp;
  status: "pending" | "accepted" | "expired";
}
