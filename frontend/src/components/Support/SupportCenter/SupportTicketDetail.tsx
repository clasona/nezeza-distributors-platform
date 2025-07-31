'use client';

import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/utils/support/createSupportTicket';
import { getTicketDetails } from '@/utils/support/getTicketDetails';
import { getAdminTicketDetails } from '@/utils/admin/getAdminTicketDetails';
import { addMessageToTicket } from '@/utils/support/addMessageToTicket';
import { adminAddMessageToTicket } from '@/utils/admin/adminAddMessageToTicket';
import { getSupportMetadata, SupportMetadata } from '@/utils/support/getSupportMetadata';
import formatDate from '@/utils/formatDate';
import Button from '@/components/FormInputs/Button';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';

interface SupportTicketDetailProps {
  ticketId: string;
  onBack?: () => void;
  onTicketUpdate?: (ticket: SupportTicket) => void;
  isAdmin?: boolean;
}

const SupportTicketDetail: React.FC<SupportTicketDetailProps> = ({
  ticketId,
  onBack,
  onTicketUpdate,
  isAdmin = false,
}) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SupportMetadata | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchTicketDetails();
    fetchMetadata();
  }, [ticketId, isAdmin]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = isAdmin 
        ? await getAdminTicketDetails(ticketId)
        : await getTicketDetails(ticketId);
      setTicket(response.ticket);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const response = await getSupportMetadata();
      setMetadata(response.metadata);
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket) return;

    try {
      setSendingMessage(true);
      const response = isAdmin
        ? await adminAddMessageToTicket(ticketId, {
            message: newMessage.trim(),
            attachments: selectedFiles,
          })
        : await addMessageToTicket(ticketId, {
            message: newMessage.trim(),
            attachments: selectedFiles,
          });
      setTicket(response.ticket);
      setNewMessage('');
      setSelectedFiles([]);
      onTicketUpdate?.(response.ticket);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error || 'Ticket not found'}</p>
        {onBack && (
          <Button
            buttonTitle="Go Back"
            onClick={onBack}
            className="mt-2"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {ticket.subject}
              </h2>
              <span className="text-sm text-gray-500">
                #{ticket.ticketNumber}
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              {ticket.description}
            </p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
              {ticket.category && metadata && (
                <span className="text-xs text-gray-500">
                  {metadata.categories.find(c => c.value === ticket.category)?.label}
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Created: {formatDate(ticket.createdAt)}</div>
            {ticket.assignedTo && (
              <div>Assigned to: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Messages</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {ticket.messages.map((message, index) => (
            <div key={message._id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {message.senderId.firstName} {message.senderId.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({message.senderRole})
                  </span>
                  {message.isInternal && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Internal
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {message.message}
              </div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {attachment.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Add Reply</h3>
          <div className="space-y-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected files:</p>
                  <ul className="text-sm text-gray-500">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                buttonTitle={sendingMessage ? 'Sending...' : 'Send Reply'}
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="bg-nezeza_dark_blue text-white hover:bg-nezeza_dark_blue_2 disabled:bg-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      {onBack && (
        <div className="flex justify-start">
          <Button
            buttonTitle="Back to Tickets"
            onClick={onBack}
            className="bg-gray-600 text-white hover:bg-gray-700"
          />
        </div>
      )}
    </div>
  );
};

export default SupportTicketDetail; 