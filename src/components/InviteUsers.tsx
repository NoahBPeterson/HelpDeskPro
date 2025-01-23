import React, { useState, useEffect } from "react";
import { X, Plus, Mail, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { Database } from "../lib/database.types";

type Invitation = Database['public']['Tables']['invitations']['Row'];

export function InviteUsers() {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Invitation['role']>("end_user");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [bulkEmails, setBulkEmails] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: "end_user",
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

  // Fetch existing invitations
  useEffect(() => {
    async function fetchInvitations() {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      setInvitations(data);
    }

    fetchInvitations();
  }, [session]);

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Send magic link
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            role,
            workspace_id: session.user.id
          }
        }
      });

      if (otpError) {
        console.error('Error sending invitation:', otpError);
        setError("Failed to send invitation");
        setIsLoading(false);
        return;
      }

      // Add to invitations list for UI
      const newInvitation: Invitation = {
        id: crypto.randomUUID(),
        email,
        role,
        status: 'pending',
        created_at: new Date().toISOString(),
        workspace_id: session.user.id,
        invited_by_user_id: session.user.id,
        token: '',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      setInvitations([...invitations, newInvitation]);
      setEmail("");
      setIsLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleBulkInvite = async () => {
    if (!session?.user) return;

    const emails = bulkEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e && validateEmail(e));

    if (emails.length === 0) {
      setError("No valid email addresses found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const invitePromises = emails.map(email => 
        supabase.auth.signInWithOtp({
          email,
          options: {
            data: {
              role,
              workspace_id: session.user.id
            }
          }
        })
      );

      const results = await Promise.allSettled(invitePromises);
      
      // Check for any failed invitations
      const failedEmails = results
        .map((result, index) => result.status === 'rejected' ? emails[index] : null)
        .filter((email): email is string => email !== null);

      if (failedEmails.length > 0) {
        setError(`Failed to send invitations to: ${failedEmails.join(', ')}`);
        setIsLoading(false);
        return;
      }

      const newInvitations: Invitation[] = emails.map(email => ({
        id: crypto.randomUUID(),
        email,
        role,
        status: 'pending',
        created_at: new Date().toISOString(),
        workspace_id: session.user.id,
        invited_by_user_id: session.user.id,
        token: '',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setInvitations([...invitations, ...newInvitations]);
      setBulkEmails("");
      setShowBulkInput(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const removeInvitation = async (id: string) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing invitation:', error);
      return;
    }

    setInvitations(invitations.filter((inv) => inv.id !== id));
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
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Invitation['role'])}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="john@example.com&#10;jane@example.com&#10;steve@example.com"
                disabled={isLoading}
              />
              <button
                onClick={handleBulkInvite}
                className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  key={inv.id}
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