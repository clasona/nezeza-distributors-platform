import AdminLayout from './layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StoreApplicationProps } from '../../../type';
import formatDate from '../../utils/formatDate';
import Button from '@/components/FormInputs/Button';
import { getStoreApplication } from '../../utils/admin/getStoreApplication';
import { approveStoreApplication } from '../../utils/admin/approveStoreApplication';
import { declineStoreApplication } from '../../utils/admin/declineStoreApplication';
import Link from 'next/link';

const StoreApplicationDetails = () => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState<StoreApplicationProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let appId: string | undefined;
    if (typeof id === 'string') appId = id;
    else if (Array.isArray(id)) appId = id[0];
    if (!appId) {
      setError('Invalid application ID.');
      setLoading(false);
      return;
    }
    getStoreApplication(appId)
      .then((res) => {
        if (res.status !== 200 || !res.data) throw new Error('Application not found');
        setApplication(res.data.application || res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl mt-10 border border-vesoko_green_600">
        <div className="flex items-center justify-between mb-6">
          <Button buttonTitle="← Back to All Applications" onClick={() => router.push('/admin/store-applications')} className="mb-0" />
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-vesoko_green_100 text-vesoko_green_800 border border-vesoko_green_600">{application?.status}</span>
        </div>
        <h2 className="text-3xl font-extrabold mb-6 text-vesoko_dark_blue tracking-tight">Store Application Details</h2>
        {loading ? (
          <div className="text-center py-12 text-lg font-medium text-vesoko_gray_600">Loading...</div>
        ) : error ? (
          <div className="text-vesoko_red_600 text-center py-8">{error}</div>
        ) : application ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2 text-base">
                <div><span className="font-semibold">Application ID:</span> {application._id}</div>
                <div><span className="font-semibold">Store Name:</span> {application.storeInfo?.name}</div>
                <div><span className="font-semibold">Store Type:</span> {application.storeInfo?.storeType}</div>
                <div><span className="font-semibold">Category:</span> {application.storeInfo?.category}</div>
                <div><span className="font-semibold">Owner:</span> {application.primaryContactInfo?.firstName} {application.primaryContactInfo?.lastName}</div>
                <div><span className="font-semibold">Owner Email:</span> {application.primaryContactInfo?.email}</div>
                <div><span className="font-semibold">Submitted:</span> {formatDate(application.createdAt)}</div>
                <div><span className="font-semibold">Updated:</span> {formatDate(application.updatedAt)}</div>
              </div>
              <div className="space-y-2 text-base">
                <div><span className="font-semibold">Business Document:</span> <Link href={application.verificationDocs?.businessDocument} target="_blank" rel="noopener noreferrer" className="text-vesoko_green_600 underline">View</Link></div>
                <div><span className="font-semibold">Identity Document:</span> <Link href={application.verificationDocs?.primaryContactIdentityDocument} target="_blank" rel="noopener noreferrer" className="text-vesoko_green_600 underline">View</Link></div>
                <div><span className="font-semibold">Store Description:</span> {application.storeInfo?.description}</div>
                <div><span className="font-semibold">Store Email:</span> {application.storeInfo?.email}</div>
                <div><span className="font-semibold">Store Phone:</span> {application.storeInfo?.phone}</div>
                <div><span className="font-semibold">Store Address:</span> {application.storeInfo?.address?.street1}, {application.storeInfo?.address?.city}, {application.storeInfo?.address?.state}, {application.storeInfo?.address?.country}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-8">
              <Button buttonTitle="Approve" className="bg-vesoko_green_600 text-white" isLoading={actionLoading && actionSuccess === null} onClick={async () => {
                setActionLoading(true);
                setActionError(null);
                try {
                  await approveStoreApplication(application._id);
                  setActionSuccess('Application approved successfully.');
                  setTimeout(() => setActionSuccess(null), 3000);
                  router.replace(router.asPath);
                } catch (err: any) {
                  setActionError(err?.message || 'Failed to approve application.');
                }
                setActionLoading(false);
              }} />
              <Button buttonTitle="Decline" className="bg-vesoko_red_600 text-white" onClick={() => setShowDeclineModal(true)} />
              <Button buttonTitle="Download JSON" className="bg-vesoko_dark_blue text-white" onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(application, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute('href', dataStr);
                downloadAnchorNode.setAttribute('download', `store-application-${application._id}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }} />
              <Button buttonTitle="Delete" className="bg-gray-400 text-white" onClick={() => alert('Delete functionality coming soon!')} />
            </div>
            {actionError && <div className="text-vesoko_red_600 mb-4">{actionError}</div>}
            {actionSuccess && <div className="text-vesoko_green_600 mb-4">{actionSuccess}</div>}
            {/* Decline Modal */}
            {showDeclineModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6 relative">
                  <button className="absolute top-2 right-2 text-vesoko_red_600 hover:text-red-800 text-2xl font-bold" onClick={() => setShowDeclineModal(false)} aria-label="Close">&times;</button>
                  <h2 className="text-xl font-bold mb-4 text-vesoko_dark_blue">Decline Store Application</h2>
                  <div className="mb-4">Are you sure you want to decline application <span className="font-semibold">{application._id}</span>?</div>
                  <textarea
                    className="w-full p-2 border rounded mb-4"
                    rows={3}
                    placeholder="Reason for declining (optional)"
                    value={declineReason}
                    onChange={e => setDeclineReason(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button buttonTitle="Cancel" className="bg-gray-200 text-gray-700" onClick={() => setShowDeclineModal(false)} />
                    <Button buttonTitle="Decline" className="bg-vesoko_red_600 text-white" isLoading={actionLoading && actionSuccess === null} onClick={async () => {
                      setActionLoading(true);
                      setActionError(null);
                      try {
                        await declineStoreApplication(application._id, declineReason);
                        setActionSuccess('Application declined successfully.');
                        setShowDeclineModal(false);
                        setTimeout(() => setActionSuccess(null), 3000);
                        router.replace(router.asPath);
                      } catch (err: any) {
                        setActionError(err?.message || 'Failed to decline application.');
                      }
                      setActionLoading(false);
                    }} />
                  </div>
                </div>
              </div>
            )}
            <div className="pt-4">
              <span className="font-semibold">Full Data:</span>
              <pre className="bg-slate-100 dark:bg-slate-800 rounded p-2 mt-1 overflow-x-auto text-xs max-h-64 border border-vesoko_green_100">{JSON.stringify(application, null, 2)}</pre>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-vesoko_red_600">Application not found.</div>
        )}
      </div>
    </AdminLayout>
  );
};

StoreApplicationDetails.noLayout = true;
export default StoreApplicationDetails;
