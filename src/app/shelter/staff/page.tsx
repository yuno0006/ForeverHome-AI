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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cat-dark">Staff Management</h1>
        <p className="mt-1 text-charcoal/50">Invite and manage your shelter team</p>
      </div>

      {/* Invite Section */}
      <Card className="bg-white border-sunny/20 rounded-2xl mb-6">
        <CardHeader>
          <CardTitle className="text-cat-dark flex items-center gap-2">
            <Plus className="h-5 w-5 text-sunny" />
            Invite New Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="inviteEmail" className="sr-only">Email</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="colleague@shelter.org"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border-sunny/20 rounded-xl"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "staff" | "admin")}
              className="rounded-xl border border-sunny/20 bg-white px-3 py-2 text-sm text-cat-dark focus:outline-none focus:ring-2 focus:ring-sunny"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              onClick={handleSendInvite}
              className="bg-sunny hover:bg-sunny/90 text-cat-dark font-semibold rounded-xl"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card className="bg-white border-sunny/20 rounded-2xl mb-6">
        <CardHeader>
          <CardTitle className="text-cat-dark">Current Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-charcoal/20 mx-auto mb-3" />
              <p className="text-charcoal/50">No staff members yet</p>
              <p className="text-sm text-charcoal/30">Invite your first team member above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-sunny/10 bg-warm-cream/30 hover:bg-warm-cream/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-sunny-light flex items-center justify-center">
                      <User className="h-5 w-5 text-cat-dark" />
                    </div>
                    <div>
                      <p className="font-semibold text-cat-dark">{member.name}</p>
                      <p className="text-sm text-charcoal/50">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={member.role === "admin" ? "bg-heart/10 text-heart" : "bg-sunny/20 text-cat-dark"}>
                      <Shield className="h-3 w-3 mr-1" />
                      {member.role}
                    </Badge>
                    <span className="text-xs text-charcoal/40 hidden sm:inline">
                      Joined {member.joinedDate}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStaff(member)}
                      className="text-heart/60 hover:text-heart hover:bg-heart/10 rounded-lg"
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
        <Card className="bg-white border-sunny/20 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-cat-dark flex items-center gap-2">
              <Clock className="h-5 w-5 text-charcoal/40" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-dashed border-sunny/30 bg-sunny-light/30"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-charcoal/40" />
                    <div>
                      <p className="font-medium text-cat-dark">{invite.email}</p>
                      <p className="text-xs text-charcoal/40">Sent {invite.sentDate}</p>
                    </div>
                  </div>
                  <Badge className="bg-sunny/20 text-cat-dark">
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
