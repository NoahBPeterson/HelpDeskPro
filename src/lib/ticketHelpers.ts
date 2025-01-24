import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import type { Ticket } from "../types/tickets";

type IconResult = {
    icon: typeof Clock | typeof AlertCircle | typeof CheckCircle;
    color: string;
};

export function getStatusIcon(status: Ticket['status']): IconResult {
    switch (status) {
        case 'new':
            return { icon: AlertCircle, color: 'text-blue-500' };
        case 'open':
            return { icon: Clock, color: 'text-yellow-500' };
        case 'pending':
            return { icon: Clock, color: 'text-orange-500' };
        case 'solved':
            return { icon: CheckCircle, color: 'text-green-500' };
        case 'closed':
            return { icon: CheckCircle, color: 'text-gray-500' };
        default:
            return { icon: AlertCircle, color: 'text-gray-500' };
    }
}

export function getStatusColor(status: Ticket['status']): string {
    switch (status) {
        case 'new':
            return 'bg-blue-100 text-blue-800';
        case 'open':
            return 'bg-yellow-100 text-yellow-800';
        case 'pending':
            return 'bg-orange-100 text-orange-800';
        case 'solved':
            return 'bg-green-100 text-green-800';
        case 'closed':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export function getPriorityIcon(priority: Ticket['priority']): IconResult {
    switch (priority) {
        case 'high':
            return { icon: AlertCircle, color: 'text-red-500' };
        case 'medium':
            return { icon: Clock, color: 'text-yellow-500' };
        case 'low':
            return { icon: CheckCircle, color: 'text-green-500' };
        default:
            return { icon: Clock, color: 'text-gray-500' };
    }
}

export function getPriorityColor(priority: Ticket['priority']): string {
    switch (priority) {
        case 'high':
            return 'text-red-500';
        case 'medium':
            return 'text-yellow-500';
        case 'low':
            return 'text-green-500';
        default:
            return 'text-gray-500';
    }
} 