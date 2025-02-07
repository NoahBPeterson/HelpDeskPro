import React, { useState, useEffect } from "react";
import { X, Plus, Mail, AlertCircle } from "lucide-react";
import { useInvites } from '../contexts/InviteContext';
import { Database } from "../lib/database.types";

type Invitation = Database['public']['Tables']['invitations']['Row'];

export function InviteUsers() {
  const {
    invitations,
    userRole,
    isLoading,
    error,
    setError,
    createInvitation,
    createBulkInvitations,
    removeInvitation
  } = useInvites();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Invitation['role']>("end_user");
  const [bulkEmails, setBulkEmails] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Get available roles based on current user's role
  const roles = (() => {
    switch (userRole) {
      case 'admin':
        return [
          { id: "end_user", label: "End User" },
          { id: "agent", label: "Support Agent" },
          { id: "admin", label: "Administrator" }
        ];
      case 'agent':
        return [
          { id: "end_user", label: "End User" }
        ];
      default:
        return [];
    }
  })();

  // Set initial role to the first available role
  useEffect(() => {
    if (roles.length > 0) {
      setRole(roles[0].id as Invitation['role']);
    }
  }, [roles]);

  if (roles.length === 0) {
    return null;
  }

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    await createInvitation(email, role);
    setEmail("");
  };

  const handleBulkInvite = async () => {
    const emails = bulkEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e && validateEmail(e));

    if (emails.length === 0) {
      setError("No valid email addresses found");
      return;
    }

    const failedEmails = await createBulkInvitations(emails, role);
    
    if (failedEmails.length > 0) {
      setError(`Failed to send invitations to: ${failedEmails.join(', ')}`);
      return;
    }

    setBulkEmails("");
    setShowBulkInput(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow">
        <div className="p-4 border-b border-gray-600 bg-gray-800">
          <h2 className="text-lg font-semibold text-white">Invite Users</h2>
          <p className="mt-1 text-sm text-gray-300">
            Invite new users to your help desk
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Single Invite Form */}
          <form onSubmit={handleSingleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">
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
                    className="focus:ring-gray-400 focus:border-gray-400 block w-full pl-10 sm:text-sm border border-gray-600 rounded-md bg-gray-700 text-gray-100"
                    placeholder="email@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Invitation['role'])}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-600 focus:outline-none focus:ring-gray-400 focus:border-gray-400 bg-gray-700 text-gray-100 sm:text-sm rounded-md"
                  disabled={isLoading}
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
                disabled={isLoading}
              >
                <Plus size={16} className="mr-1" />
                Bulk Invite
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Invitation"}
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
                className="shadow-sm focus:ring-gray-400 focus:border-gray-400 block w-full sm:text-sm border border-gray-600 rounded-md bg-gray-700 text-gray-100"
                placeholder="john@example.com&#10;jane@example.com&#10;steve@example.com"
                disabled={isLoading}
              />
              <button
                onClick={handleBulkInvite}
                className="mt-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-600 rounded-md hover:from-gray-600 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Bulk Invitations"}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow">
          <div className="p-4 border-b border-gray-600 bg-gray-800">
            <h3 className="text-lg font-semibold text-white">
              Pending Invitations
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-700 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Mail size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {inv.email}
                      </p>
                      <p className="text-sm text-gray-300">
                        Role: {roles.find((r) => r.id === inv.role)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {inv.status === "pending" && (
                      <span className="flex items-center text-yellow-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        Pending
                      </span>
                    )}
                    <button
                      onClick={() => removeInvitation(inv.id)}
                      className="text-gray-400 hover:text-gray-500"
                      disabled={isLoading}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}