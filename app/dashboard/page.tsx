"use client"

import useSigner from '@/app/state';
import React, { useEffect, useState } from 'react';
import RequestList, { GetRequestsResponse, Request as SwapRequest } from './RequestList';
import Popup from './Popup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const Dashboard: React.FC = () => {
    const router = useRouter();
    const { token } = useSigner();
    const [requests, setRequests] = useState<SwapRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState(false);

    const togglePopup = () => {
        setIsOpen(prev => !prev);
    };
    const fetchData = async (ttoken: string) => {
        if (!(ttoken != null && ttoken.length > 0)) {
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/request', {
                headers: {
                    Authorization: `Bearer ${ttoken}`
                }
            });
            if (!response.ok) {
                const body = await response.json();
                toast.error(body.error);
            } else {
                const data: GetRequestsResponse = await response.json();
                setRequests(data.requests);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token || (token && token.length === 0)) {
            router.push("/");
        }
    }, [token]);

    useEffect(() => {
        fetchData(token as string);
    }, [token]);

    return (
        <>
            {loading &&
                <div>Loading...</div>
            }
            {!loading &&
                <div>
                    <RequestList requests={requests} refresh={() => {
                        fetchData(token as string);
                    }} />
                    <button
                        onClick={togglePopup}
                        className="fixed bottom-4 right-4 z-10 bg-blue-500 text-white rounded-full p-4 shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >{ }
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                    </button>
                    {isOpen && <Popup onClose={togglePopup} />}
                </div>
            }
        </>
    );
};

export default Dashboard;
