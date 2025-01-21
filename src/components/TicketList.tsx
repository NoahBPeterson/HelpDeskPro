import { useNavigate } from "react-router-dom";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
const MOCK_TICKETS = [
  {
    id: 1,
    title: "Cannot access admin dashboard",
    status: "open",
    priority: "high",
    created: "2023-08-10",
    requester: "john@example.com",
  },
  {
    id: 2,
    title: "Need help with billing",
    status: "pending",
    priority: "medium",
    created: "2023-08-09",
    requester: "sarah@example.com",
  },
  {
    id: 3,
    title: "Feature request: Dark mode",
    status: "solved",
    priority: "low",
    created: "2023-08-08",
    requester: "mike@example.com",
  },
];
export function TicketList() {
  const navigate = useNavigate();
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">All Tickets</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {MOCK_TICKETS.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/ticket/${ticket.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(ticket.status)}
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {ticket.requester} · {ticket.created}
                  </p>
                </div>
              </div>
              <span
                className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${ticket.priority === "high" ? "bg-red-100 text-red-800" : ""}
                ${ticket.priority === "medium" ? "bg-yellow-100 text-yellow-800" : ""}
                ${ticket.priority === "low" ? "bg-green-100 text-green-800" : ""}
              `}
              >
                {ticket.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
