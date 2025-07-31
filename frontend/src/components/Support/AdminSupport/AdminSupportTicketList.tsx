'use client';

import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/utils/support/createSupportTicket';
import { getAllSupportTickets, GetAllTicketsParams } from '@/utils/admin/getAllSupportTickets';
import { getSupportMetadata, SupportMetadata } from '@/utils/support/getSupportMetadata';
import { updateTicketAdmin } from '@/utils/admin/updateTicketAdmin';
import { assignTicket } from '@/utils/admin/assignTicket';
import formatDate from '@/utils/formatDate';
import Button from '@/components/FormInputs/Button';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';

interface AdminSupportTicketListProps {
  onTicketSelect?: (ticket: SupportTicket) => void;
  className?: string;
}

const AdminSupportTicketList: React.FC<AdminSupportTicketListProps> = ({
  onTicketSelect,
  className = '',
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SupportMetadata | null>(null);
  const [filters, setFilters] = useState<GetAllTicketsParams>({
    limit: 20,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

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
      const response = await getAllSupportTickets(filters);
      setTickets(response.tickets);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof GetAllTicketsParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset pagination when filters change
    }));
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({
      ...prev,
      offset: newOffset,
    }));
  };

  const handleTicketSelect = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTickets(prev => [...prev, ticketId]);
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(tickets.map(ticket => ticket._id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTickets.length === 0) return;

    try {
      for (const ticketId of selectedTickets) {
        await updateTicketAdmin(ticketId, { status: bulkAction });
      }
      setSelectedTickets([]);
      setBulkAction('');
      fetchTickets(); // Refresh the list
    } catch (error: any) {
      setError(error.message);
    }
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
      {/* Filters */}
      {metadata && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <DropdownInputSearchable
              name="status"
              label=""
              options={metadata.statuses}
              value={filters.status ? { value: filters.status as string, label: metadata.statuses.find(s => s.value === filters.status)?.label || '' } : undefined}
              onChange={(option) => handleFilterChange('status', option?.value)}
              isRequired={false}
            />
            <DropdownInputSearchable
              name="priority"
              label=""
              options={metadata.priorities}
              value={filters.priority ? { value: filters.priority as string, label: metadata.priorities.find(p => p.value === filters.priority)?.label || '' } : undefined}
              onChange={(option) => handleFilterChange('priority', option?.value)}
              isRequired={false}
            />
            <DropdownInputSearchable
              name="category"
              label=""
              options={metadata.categories}
              value={filters.category ? { value: filters.category as string, label: metadata.categories.find(c => c.value === filters.category)?.label || '' } : undefined}
              onChange={(option) => handleFilterChange('category', option?.value)}
              isRequired={false}
            />
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedTickets.length} ticket(s) selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select action...</option>
              <option value="in_progress">Mark as In Progress</option>
              <option value="waiting_customer">Mark as Waiting for Customer</option>
              <option value="resolved">Mark as Resolved</option>
              <option value="closed">Mark as Closed</option>
            </select>
            <Button
              buttonTitle="Apply"
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            />
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {tickets.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No support tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTickets.length === tickets.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className={`hover:bg-gray-50 ${onTicketSelect ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      console.log('Row clicked for ticket:', ticket._id);
                      console.log('onTicketSelect function:', onTicketSelect);
                      onTicketSelect?.(ticket);
                    }}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket._id)}
                        onChange={(e) => handleTicketSelect(ticket._id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.subject}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{ticket.ticketNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {ticket.userId.firstName} {ticket.userId.lastName}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {ticket.userRole}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {ticket.assignedTo ? (
                          `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
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

export default AdminSupportTicketList; 