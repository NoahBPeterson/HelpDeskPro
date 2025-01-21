import React, { useState } from "react";
import { X, Plus, Mail, AlertCircle, CheckCircle } from "lucide-react";
interface Invitation {
  email: string;
  role: string;
  status: "pending" | "sent" | "error";
}
export function InviteUsers() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("end-user");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [bulkEmails, setBulkEmails] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [error, setError] = useState("");
  const roles = [
    {
      id: "end-user",
      label: "End User",
    },
    {
      id: "agent",
      label: "Support Agent",
    },
    {
      id: "admin",
      label: "Administrator",
    },
  ];
  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };
  const handleSingleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (invitations.some((inv) => inv.email === email)) {
      setError("This email has already been invited");
      return;
    }
    setInvitations([
      ...invitations,
      {
        email,
        role,
        status: "pending",
      },
    ]);
    setEmail("");
    setError("");
  };
  const handleBulkInvite = () => {
    const emails = bulkEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e && validateEmail(e));
    const newInvitations = emails.map((email) => ({
      email,
      role,
      status: "pending" as const,
    }));
    setInvitations([...invitations, ...newInvitations]);
    setBulkEmails("");
    setShowBulkInput(false);
  };
  const removeInvitation = (email: string) => {
    setInvitations(invitations.filter((inv) => inv.email !== email));
  };
  const sendInvitations = () => {
    // In a real app, this would make an API call
    setInvitations(
      invitations.map((inv) => ({
        ...inv,
        status: "sent",
      })),
    );
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Invite Users</h2>
          <p className="mt-1 text-sm text-gray-500">
            Invite new users to your help desk
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Single Invite Form */}
          <form onSubmit={handleSingleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {error}
              </p>
            )}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowBulkInput(!showBulkInput)}
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Bulk Invite
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Invitation
              </button>
            </div>
          </form>
          {/* Bulk Invite Textarea */}
          {showBulkInput && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bulk Email Addresses (one per line)
              </label>
              <textarea
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="john@example.com&#10;jane@example.com&#10;steve@example.com"
              />
              <button
                onClick={handleBulkInvite}
                className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                Add Bulk Invitations
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Pending Invitations
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.email}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Mail size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {inv.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Role: {roles.find((r) => r.id === inv.role)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {inv.status === "sent" && (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle size={16} className="mr-1" />
                        Sent
                      </span>
                    )}
                    <button
                      onClick={() => removeInvitation(inv.email)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {invitations.some((inv) => inv.status === "pending") && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={sendInvitations}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Send {invitations.length} Invitation
                  {invitations.length !== 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}