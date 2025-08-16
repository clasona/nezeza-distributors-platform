'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SupportTicket } from '@/utils/support/createSupportTicket';
import { getAllSupportTickets, GetAllTicketsParams } from '@/utils/admin/getAllSupportTickets';
import { getSupportMetadata, SupportMetadata } from '@/utils/support/getSupportMetadata';
import { updateTicketAdmin } from '@/utils/admin/updateTicketAdmin';
import { assignTicket } from '@/utils/admin/assignTicket';
import { bulkUpdateTickets } from '@/utils/admin/bulkUpdateTickets';
import { getAdminUsers, AdminUser } from '@/utils/admin/getAdminUsers';
import { respondToTicket } from '@/utils/admin/respondToTicket';
import formatDate from '@/utils/formatDate';
import Button from '@/components/FormInputs/Button';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import AttachmentViewer from '@/components/Support/AttachmentViewer';
import { formatAttachmentCountDisplay } from '@/utils/attachmentUtils';

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
  const [bulkPriority, setBulkPriority] = useState<string>('');
  const [bulkAssignee, setBulkAssignee] = useState<string>('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [bulkActionType, setBulkActionType] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [ticketUpdates, setTicketUpdates] = useState<{ [key: string]: any }>({});
  const [updatingTickets, setUpdatingTickets] = useState<string[]>([]);
  
  // Separate state for search input to prevent focus loss
  const [searchInput, setSearchInput] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced search handler
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout to update filters after 500ms of no typing
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: value,
        offset: 0, // Reset pagination when filters change
      }));
    }, 500);
  }, []);
  
  // Initialize search input from filters
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchMetadata();
    fetchAdminUsers();
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

  const fetchAdminUsers = async () => {
    try {
      const response = await getAdminUsers();
      setAdminUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
      setAdminUsers([]); // Ensure adminUsers is always an array
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
    if ((!bulkAction && !bulkPriority && !bulkAssignee) || selectedTickets.length === 0) return;

    try {
      setBulkLoading(true);
      const updates: any = {};
      
      if (bulkAction) updates.status = bulkAction;
      if (bulkPriority) updates.priority = bulkPriority;
      if (bulkAssignee) updates.assignedTo = bulkAssignee;

      await bulkUpdateTickets({
        ticketIds: selectedTickets,
        updates
      });
      
      setSelectedTickets([]);
      setBulkAction('');
      setBulkPriority('');
      setBulkAssignee('');
      setBulkActionType('');
      fetchTickets(); // Refresh the list
    } catch (error: any) {
      setError(error.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleIndividualTicketUpdate = async (ticketId: string, field: string, value: string) => {
    try {
      setUpdatingTickets([...updatingTickets, ticketId]);
      await updateTicketAdmin(ticketId, { [field]: value });
      fetchTickets(); // Refresh the list
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdatingTickets(updatingTickets.filter(id => id !== ticketId));
    }
  };

  const handleAssignTicket = async (ticketId: string, adminId: string) => {
    try {
      setUpdatingTickets([...updatingTickets, ticketId]);
      await assignTicket(ticketId, { assignedTo: adminId });
      fetchTickets(); // Refresh the list
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdatingTickets(updatingTickets.filter(id => id !== ticketId));
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
    <div className={`space-y-3 ${className}`}>
      {/* Filters */}
      {metadata && (
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <h3 className="text-base font-semibold mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {selectedTickets.length} ticket(s) selected
              </span>
              <Button
                buttonTitle="Clear Selection"
                onClick={() => setSelectedTickets([])}
                className="bg-gray-500 text-white hover:bg-gray-600 text-xs px-3 py-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Bulk Status Update */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select status...</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_customer">Waiting for Customer</option>
                  <option value="waiting_admin">Waiting for Admin</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Bulk Priority Update */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={bulkPriority}
                  onChange={(e) => setBulkPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select priority...</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Bulk Assignment */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={bulkAssignee}
                  onChange={(e) => setBulkAssignee(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select admin...</option>
                  {adminUsers && adminUsers.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.firstName} {admin.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apply Button */}
              <div className="flex items-end">
                <Button
                  buttonTitle={bulkLoading ? 'Applying...' : 'Apply Changes'}
                  onClick={handleBulkAction}
                  disabled={(!bulkAction && !bulkPriority && !bulkAssignee) || bulkLoading}
                  className="w-full bg-nezeza_dark_blue text-white hover:bg-nezeza_dark_blue_2 disabled:bg-gray-400"
                />
              </div>
            </div>
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
                    Attachments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                        {ticket.userId ? `${ticket.userId.firstName} ${ticket.userId.lastName}` : 'Unknown User'}
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
                    <td className="px-4 py-4">
                      {(() => {
                        const attachmentDisplay = formatAttachmentCountDisplay(ticket);
                        return attachmentDisplay.count > 0 ? (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700" title={attachmentDisplay.tooltip}>
                              {attachmentDisplay.count}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No files</span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-1">
                        {/* Status Update */}
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          value={ticket.status}
                          onChange={(e) => handleIndividualTicketUpdate(ticket._id, 'status', e.target.value)}
                          disabled={updatingTickets.includes(ticket._id)}
                        >
                          {metadata?.statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        
                        {/* Priority Update */}
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          value={ticket.priority}
                          onChange={(e) => handleIndividualTicketUpdate(ticket._id, 'priority', e.target.value)}
                          disabled={updatingTickets.includes(ticket._id)}
                        >
                          {metadata?.priorities.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                        
                        {/* Assignment Update */}
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          value={ticket.assignedTo?._id || ''}
                          onChange={(e) => handleAssignTicket(ticket._id, e.target.value)}
                          disabled={updatingTickets.includes(ticket._id)}
                        >
                          <option value="">Unassigned</option>
                          {adminUsers && adminUsers.map((admin) => (
                            <option key={admin._id} value={admin._id}>
                              {admin.firstName} {admin.lastName}
                            </option>
                          ))}
                        </select>
                        
                        {updatingTickets.includes(ticket._id) && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-900"></div>
                            Updating...
                          </div>
                        )}
                      </div>
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
