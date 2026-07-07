"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, Plus, Trash2, Clock, User } from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  joinedDate: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: "admin" | "staff";
  sentDate: string;
}

const demoStaff: StaffMember[] = [
  { id: "1", name: "Dr. Sarah Chen", email: "sarah@foreverhome.org", role: "admin", joinedDate: "Jan 15, 2024" },
  { id: "2", name: "Marcus Rivera", email: "marcus@foreverhome.org", role: "staff", joinedDate: "Mar 3, 2024" },
  { id: "3", name: "Emily Watson", email: "emily@foreverhome.org", role: "staff", joinedDate: "May 20, 2024" },
];

const demoPendingInvites: PendingInvite[] = [
  { id: "p1", email: "newstaff@foreverhome.org", role: "staff", sentDate: "Jun 25, 2024" },
];

export default function StaffManagementPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"staff" | "admin">("staff");
  const [staff, setStaff] = useState<StaffMember[]>(demoStaff);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(demoPendingInvites);

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    toast.success(`Invitation sent to ${inviteEmail}`);
    setPendingInvites([
      ...pendingInvites,
      { id: Date.now().toString(), email: inviteEmail, role: inviteRole, sentDate: "Today" },
    ]);
    setInviteEmail("");
  };

  const handleRemoveStaff = (member: StaffMember) => {
    setStaff(staff.filter((s) => s.id !== member.id));
    toast.success(`${member.name} has been removed from staff`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight leading-none">Staff Management</h1>
        <p className="mt-3 text-base text-cocoa/60 font-medium max-w-xl leading-relaxed">Invite and manage your shelter team, assign roles, and handle access control.</p>
      </div>

      {/* Invite Section */}
      <Card className="bg-white border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)] rounded-[2rem] mb-10 overflow-hidden">
        <CardHeader className="bg-sunny/10 border-b-2 border-cocoa/10 px-8 py-6">
          <CardTitle className="font-display text-2xl font-black text-cocoa flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sunny flex items-center justify-center">
              <Plus className="h-6 w-6 text-sunny-deep" />
            </div>
            Invite New Staff
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="inviteEmail" className="sr-only">Email</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="colleague@shelter.org"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border-2 border-cocoa/10 rounded-xl px-4 py-6 text-base shadow-inner focus-visible:ring-sunny-deep focus-visible:border-sunny-deep"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "staff" | "admin")}
              className="rounded-xl border-2 border-cocoa/10 bg-white px-4 py-3 text-base font-bold text-cocoa shadow-inner focus:outline-none focus:ring-2 focus:ring-sunny-deep cursor-pointer"
            >
              <option value="staff">Staff Member</option>
              <option value="admin">Administrator</option>
            </select>
            <Button
              onClick={handleSendInvite}
              className="bg-cocoa hover:bg-cocoa/90 text-cream px-8 py-6 rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all text-base"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card className="bg-white border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)] rounded-[2rem] mb-10 overflow-hidden">
        <CardHeader className="bg-cream/50 border-b-2 border-cocoa/10 px-8 py-6">
          <CardTitle className="font-display text-2xl font-black text-cocoa">Current Staff</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {staff.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-cocoa/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border-2 border-cocoa/10">
                <User className="h-10 w-10 text-cocoa/30" />
              </div>
              <p className="font-display text-2xl font-black text-cocoa">No staff members yet</p>
              <p className="text-sm font-bold text-cocoa/50 mt-2">Invite your first team member above</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-cocoa/5">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-8 hover:bg-cream/30 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-lavender/20 to-sage/20 border-2 border-cocoa/10 flex items-center justify-center shadow-sm shrink-0">
                      <span className="font-display text-xl font-black text-cocoa">{member.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-display text-xl font-black text-cocoa">{member.name}</p>
                      <p className="text-sm font-bold text-cocoa/60">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-lg border-2 ${member.role === "admin" ? "bg-coral/15 text-coral-deep border-coral/30" : "bg-sunny/20 text-sunny-deep border-sunny/30"}`}>
                      <Shield className="h-3.5 w-3.5 mr-1.5" />
                      {member.role}
                    </Badge>
                    <span className="text-sm font-bold text-cocoa/40 hidden md:inline">
                      Joined {member.joinedDate}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveStaff(member)}
                      className="border-2 border-cocoa/10 text-coral hover:bg-coral/10 hover:border-coral/30 rounded-xl transition-all shadow-sm w-10 h-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card className="bg-white border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,0.05)] rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-cream/50 border-b-2 border-cocoa/10 px-8 py-6">
            <CardTitle className="font-display text-2xl font-black text-cocoa flex items-center gap-3">
              <Clock className="h-6 w-6 text-cocoa/40" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y-2 divide-cocoa/5">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between px-8 py-6 bg-white hover:bg-cream/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cocoa/5 border-2 border-cocoa/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-cocoa/40" />
                    </div>
                    <div>
                      <p className="font-bold text-cocoa text-lg">{invite.email}</p>
                      <p className="text-sm font-bold text-cocoa/40">Sent {invite.sentDate}</p>
                    </div>
                  </div>
                  <Badge className="px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-lg border-2 bg-cocoa/5 text-cocoa/60 border-cocoa/10">
                    {invite.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
