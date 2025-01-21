import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Inbox,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
export function Dashboard() {
  const navigate = useNavigate();
  // Mock data - in a real app, this would come from an API
  const stats = {
    total: 125,
    open: 45,
    pending: 32,
    solved: 48,
    highPriority: 12,
  };
  const recentActivity = [
    {
      id: 1,
      title: "New high-priority ticket",
      description: "Cannot access admin dashboard",
      time: "10 minutes ago",
      type: "high-priority",
    },
    {
      id: 2,
      title: "Ticket resolved",
      description: "Login issue fixed",
      time: "1 hour ago",
      type: "resolved",
    },
    {
      id: 3,
      title: "Customer response",
      description: "Updated ticket #1234",
      time: "2 hours ago",
      type: "update",
    },
  ];
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total}
              </p>
            </div>
            <Inbox className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.open}
              </p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pending}
              </p>
            </div>
            <Clock className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Solved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.solved}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Activity
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {activity.type === "high-priority" && (
                    <AlertTriangle className="text-red-500 mt-1" size={20} />
                  )}
                  {activity.type === "resolved" && (
                    <CheckCircle className="text-green-500 mt-1" size={20} />
                  )}
                  {activity.type === "update" && (
                    <TrendingUp className="text-blue-500 mt-1" size={20} />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Ticket Overview
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>High Priority</span>
                  <span>{stats.highPriority} tickets</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.highPriority / stats.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Response Time</span>
                  <span>1.5 hours avg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: "75%",
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Resolution Rate</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: "92%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
