'use client';

import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/utils/support/createSupportTicket';
import { getTicketDetails } from '@/utils/support/getTicketDetails';
import { getAdminTicketDetails } from '@/utils/admin/getAdminTicketDetails';
import { addMessageToTicket } from '@/utils/support/addMessageToTicket';
import { adminAddMessageToTicket } from '@/utils/admin/adminAddMessageToTicket';
import { getSupportMetadata, SupportMetadata } from '@/utils/support/getSupportMetadata';
import formatDate from '@/utils/formatDate';
import { formatDateTimeLocale } from '@/utils/formatDateTime';
import Button from '@/components/FormInputs/Button';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import CloudinaryUploadWidget from '@/components/Cloudinary/UploadWidget';
import AttachmentViewer from '@/components/Support/AttachmentViewer';

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
  const [replyAttachmentUrls, setReplyAttachmentUrls] = useState<string[]>([]);

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

  // Helper function to convert URLs to attachment objects
  const formatUrlsToAttachments = (urls: string[]) => {
    return urls.map((url, index) => ({
      filename: `reply-attachment-${index + 1}.${url.split('.').pop() || 'file'}`,
      url: url,
      fileType: url.split('.').pop() || 'file',
      fileSize: 0, // Size unknown from URL
      public_id: url.split('/').pop()?.split('.')[0] || `reply-attachment-${index + 1}`
    }));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket) return;

    try {
      setSendingMessage(true);
      
      // Convert Cloudinary URLs to cloudinaryAttachments format
      const cloudinaryAttachments = replyAttachmentUrls.length > 0 
        ? formatUrlsToAttachments(replyAttachmentUrls)
        : undefined;
      
      const response = isAdmin
        ? await adminAddMessageToTicket(ticketId, {
            message: newMessage.trim(),
            cloudinaryAttachments,
          })
        : await addMessageToTicket(ticketId, {
            message: newMessage.trim(),
            cloudinaryAttachments,
          });
      setTicket(response.ticket);
      setNewMessage('');
      setReplyAttachmentUrls([]);
      onTicketUpdate?.(response.ticket);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSendingMessage(false);
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
            
            {/* Initial Ticket Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-4">
                <AttachmentViewer 
                  attachments={ticket.attachments}
                  title="Initial Attachments"
                  maxDisplay={3}
                />
              </div>
            )}
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
                  {formatDateTimeLocale(message.createdAt)}
                </span>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {message.message}
              </div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3">
                  <AttachmentViewer 
                    attachments={message.attachments}
                    title="Message Attachments"
                    maxDisplay={2}
                  />
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
            
            {/* Attachments for Reply */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (optional)
              </label>
              <div className="space-y-3">
                {/* Display uploaded attachments */}
                {replyAttachmentUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Reply Attachments ({replyAttachmentUrls.length}/3):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {replyAttachmentUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img
                                src={url}
                                alt={`Reply Attachment ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-gray-500 text-center px-1">
                                {url.split('.').pop()?.toUpperCase() || 'FILE'}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setReplyAttachmentUrls(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            title="Remove attachment"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload widget */}
                {replyAttachmentUrls.length < 3 && (
                  <CloudinaryUploadWidget
                    onUpload={(urls) => setReplyAttachmentUrls((prev) => [...prev, ...urls])}
                    maxFiles={3 - replyAttachmentUrls.length}
                    folder="support-tickets/replies"
                    buttonText={`Upload Files (${replyAttachmentUrls.length}/3)`}
                    className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 text-center hover:bg-gray-100 hover:border-vesoko_dark_blue transition-all duration-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Add Files ({replyAttachmentUrls.length}/3)
                      </span>
                    </div>
                  </CloudinaryUploadWidget>
                )}
                
                <div className="text-xs text-gray-500">
                  <p>• Supported formats: Images, PDF, DOC, DOCX, TXT, ZIP, XLS, XLSX</p>
                  <p>• Maximum file size: 10MB per file</p>
                  <p>• Maximum 3 files per reply</p>
                </div>
              </div>
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