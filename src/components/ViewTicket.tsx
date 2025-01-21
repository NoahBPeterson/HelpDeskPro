import { useParams, useNavigate } from "react-router-dom";
import { Clock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
export function ViewTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Mock ticket data - in a real app, this would come from an API
  const ticket = {
    id: parseInt(id as string),
    title: "Cannot access admin dashboard",
    status: "open",
    priority: "high",
    created: "2023-08-10",
    requester: "john@example.com",
    description:
      "I'm trying to access the admin dashboard but keep getting an error message. This is preventing me from managing user accounts and other administrative tasks.",
    updates: [
      {
        id: 1,
        author: "Support Team",
        message:
          "We're looking into this issue. Could you please provide your browser version?",
        timestamp: "2023-08-10 14:30",
      },
    ],
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="text-red-500" size={18} />;
      case "pending":
        return <Clock className="text-yellow-500" size={18} />;
      case "solved":
        return <CheckCircle className="text-green-500" size={18} />;
      default:
        return null;
    }
  };
  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back to tickets
      </button>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {ticket.title}
            </h2>
            <div className="flex items-center space-x-2">
              {getStatusIcon(ticket.status)}
              <span className="text-sm font-medium capitalize">
                {ticket.status}
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Requested by {ticket.requester} on {ticket.created}
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Updates</h3>
            {ticket.updates.map((update) => (
              <div key={update.id} className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{update.author}</span>
                  <span className="text-gray-500">{update.timestamp}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{update.message}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Add Response
            </h3>
            <textarea
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Type your response..."
            />
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Send Response
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
