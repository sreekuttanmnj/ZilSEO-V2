import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { useWebsite } from '../context/WebsiteContext';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function GscCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { selectedWebsite, refreshWebsites } = useWebsite();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // In case we want to restore specific site

        if (!code) {
            setStatus('error');
            setError('No authorization code found in URL.');
            return;
        }

        handleCallback(code, state);
    }, [searchParams]);

    const handleCallback = async (code: string, state: string | null) => {
        try {
            const tokens = await MockService.handleGscCallback(code);
            const targetSiteId = state || (selectedWebsite ? selectedWebsite.id : null);

            if (targetSiteId) {
                // Save tokens globally for the Import Wizard
                localStorage.setItem('gsc_access_token', tokens.access_token);
                if (tokens.refresh_token) {
                    localStorage.setItem('gsc_refresh_token', tokens.refresh_token);
                }

                await MockService.connectGSC(
                    targetSiteId,
                    tokens.email || 'authorized-user@google.com', // Use email from response
                    tokens.access_token,
                    tokens.refresh_token
                );
                await refreshWebsites();
                setStatus('success');
                setTimeout(() => navigate('/tracking'), 2000);
            } else {
                // If no website selected, we might need the user to link it manually or we auto-match
                setStatus('error');
                setError('Google account authorized, but no website was selected to link it to. Please go to SEO Tracking and try again.');
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setError(err.message || 'Failed to exchange authorization code for tokens.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-800">Authorizing...</h2>
                        <p className="text-gray-500 mt-2">Connecting to Google Search Console. Please wait.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Connection Successful!</h2>
                        <p className="text-gray-500 mt-2">Your Google Search Console is now linked. Redirecting you back...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Connection Failed</h2>
                        <p className="text-gray-600 mt-2">{error}</p>
                        <button
                            onClick={() => navigate('/tracking')}
                            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Back to Tracking
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
