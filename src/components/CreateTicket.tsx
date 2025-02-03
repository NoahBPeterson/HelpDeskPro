import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, AlertCircle } from "lucide-react";
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function CharacterCount({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  const radius = 10; // Slightly larger to fit text
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let color = 'text-blue-500';
  if (percentage >= 95) color = 'text-red-500';
  else if (percentage >= 80) color = 'text-yellow-500';

  return (
    <div className="relative inline-flex items-center">
      <div className="relative w-7 h-7">
        <svg className="w-7 h-7 transform -rotate-90">
          <circle
            cx="14"
            cy="14"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={`${color} transition-all duration-300`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset
            }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center ${color} text-xs font-medium`}>
          {percentage >= 80 ? max - current : current}
        </div>
      </div>
    </div>
  );
}

interface FormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  category: string;
  email: string;
  name: string;
  attachments: File[];
}

export function CreateTicket() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    priority: "medium",
    category: "technical",
    email: session?.user?.email || "",
    name: "",
    attachments: [],
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    {
      id: "technical",
      label: "Technical Issue",
    },
    {
      id: "billing",
      label: "Billing Question",
    },
    {
      id: "account",
      label: "Account Access",
    },
    {
      id: "feature",
      label: "Feature Request",
    },
    {
      id: "other",
      label: "Other",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.title.trim()) newErrors.title = "Subject is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !session?.user) return;
    
    setIsSubmitting(true);
    try {
      // Get user's workspace_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('id', session.user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.workspace_id) throw new Error('No workspace found');

      // Create the ticket
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
          workspace_id: userData.workspace_id,
          created_by_user_id: session.user.id,
          status: 'new'
        });

      if (ticketError) throw ticketError;

      // TODO: Handle file uploads in a future enhancement
      
      navigate("/tickets");
    } catch (err) {
      console.error('Error creating ticket:', err);
      setErrors(prev => ({
        ...prev,
        title: err instanceof Error ? err.message : 'Failed to create ticket'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <h2 className="text-2xl font-bold text-white">
            Create New Ticket
          </h2>
          <p className="mt-2 text-blue-100">
            Please provide detailed information about your issue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-blue-400">
          {/* Contact Information */}
          <div className="bg-blue-300 rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  className={`w-full rounded-lg shadow-sm transition-colors bg-white ${
                    errors.name 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className={`w-full rounded-lg shadow-sm transition-colors bg-white ${
                    errors.email 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-blue-300 rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={80}
                  className={`w-full rounded-lg shadow-sm pr-12 transition-colors bg-white ${
                    errors.title 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CharacterCount current={formData.title.length} max={80} />
                </div>
              </div>
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
                >
                  <option value="low">🟢 Low - General inquiry or minor issue</option>
                  <option value="medium">🟡 Medium - Service impacted but working</option>
                  <option value="high">🔴 High - Service completely unavailable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <textarea
                  required
                  maxLength={2000}
                  rows={6}
                  className={`w-full rounded-lg shadow-sm pr-12 transition-colors bg-white ${
                    errors.description 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="absolute right-3 top-3">
                  <CharacterCount current={formData.description.length} max={2000} />
                </div>
              </div>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-blue-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors bg-white">
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  Up to 10 files, max 5MB each
                </p>
              </div>
            </div>
            {formData.attachments.length > 0 && (
              <ul className="mt-4 space-y-2">
                {formData.attachments.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
