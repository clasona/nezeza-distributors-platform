'use client';

import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/utils/support/createSupportTicket';
import { getUserTickets } from '@/utils/support/getUserTickets';
import formatDate from '@/utils/formatDate';
import Button from '@/components/FormInputs/Button';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import { getSupportMetadata, SupportMetadata } from '@/utils/support/getSupportMetadata';

interface SupportTicketListProps {
  onTicketSelect?: (ticket: SupportTicket) => void;
  showFilters?: boolean;
  className?: string;
}

// Simple local filter interface since the API doesn't support filtering yet
interface LocalFilters {
  status?: string;
  category?: string;
  priority?: string;
}

const SupportTicketList: React.FC<SupportTicketListProps> = ({
  onTicketSelect,
  showFilters = true,
  className = '',
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SupportMetadata | null>(null);
  const [filters, setFilters] = useState<LocalFilters>({});
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchMetadata = async () => {
    try {
      const response = await getSupportMetadata();
      setMetadata(response.metadata);
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getUserTickets();
      setTickets(response.tickets);
      // Note: API doesn't support pagination yet, so we'll just show all tickets
      setPagination({
        total: response.tickets.length,
        limit: 10,
        offset: 0,
        hasMore: false,
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof LocalFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({
      ...prev,
      offset: newOffset,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_customer':
        return 'bg-orange-100 text-orange-800';
      case 'waiting_admin':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <p className="text-red-600">{error}</p>
        <Button
          buttonTitle="Retry"
          onClick={fetchTickets}
          className="mt-2"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showFilters && metadata && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DropdownInputSearchable
              name="status"
              label="Status"
              options={metadata.statuses}
              value={filters.status ? { value: filters.status, label: metadata.statuses.find(s => s.value === filters.status)?.label || '' } : undefined}
              onChange={(option) => handleFilterChange('status', option?.value)}
              isRequired={false}
            />
            <DropdownInputSearchable
              name="category"
              label="Category"
              options={metadata.categories}
              value={filters.category ? { value: filters.category, label: metadata.categories.find(c => c.value === filters.category)?.label || '' } : undefined}
              onChange={(option) => handleFilterChange('category', option?.value)}
              isRequired={false}
            />
            <DropdownInputSearchable
              name="priority"
              label="Priority"
              options={metadata.priorities}
              value={filters.priority ? { value: filters.priority, label: metadata.priorities.find(p => p.value === filters.priority)?.label || '' } : undefined}
              onChange={(option) => handleFilterChange('priority', option?.value)}
              isRequired={false}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        {tickets.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No support tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  onTicketSelect ? 'cursor-pointer' : ''
                }`}
                onClick={() => onTicketSelect?.(ticket)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {ticket.subject}
                      </h4>
                      <span className="text-sm text-gray-500">
                        #{ticket.ticketNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      {ticket.category && (
                        <span className="text-xs text-gray-500">
                          {metadata?.categories.find(c => c.value === ticket.category)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{formatDate(ticket.createdAt)}</div>
                    {ticket.messages && ticket.messages.length > 1 && (
                      <div className="text-xs">
                        {ticket.messages.length - 1} replies
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.hasMore && (
        <div className="flex justify-center">
          <Button
            buttonTitle="Load More"
            onClick={() => handlePageChange(pagination.offset + pagination.limit)}
            className="bg-gray-800 text-white hover:bg-gray-700"
          />
        </div>
      )}
    </div>
  );
};

export default SupportTicketList; 