"use client"

import useSigner from '@/app/state';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
type MatchedRequest = {
  id: number;
  student_id: number;
  category_id: number;
  subject_id: number;
  subject_name: string;
  preference_number_current: number;
  preference_number_other: number;
  enrollment: string;
  phone: string;
  email: string;
  name: string;
};


type MatchedRequestsTableProps = {
  matchedRequests: MatchedRequest[];
};

const MatchedRequestsTable: React.FC<MatchedRequestsTableProps> = ({ matchedRequests }) => {
  const [selectedRequest, setSelectedRequest] = useState<MatchedRequest | null>(null);

  const handleClick = (request: MatchedRequest) => {
    setSelectedRequest(request);
  };

  const closePopup = () => {
    setSelectedRequest(null);
  };


  return (
    <div>
      {selectedRequest && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Contact Details
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Enrollment: {selectedRequest.enrollment}</p>
                      <p className="text-sm text-gray-500">Phone: {selectedRequest.phone}</p>
                      <p className="text-sm text-gray-500">Email: {selectedRequest.email}</p>
                      <p className="text-sm text-gray-500">Name: {selectedRequest.name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={closePopup} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        matchedRequests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    My Preference
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Their Preference
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matchedRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{request.subject_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.preference_number_current}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.preference_number_other}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleClick(request)} // Call function with request ID
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {request.name}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      {matchedRequests.length===0 && (
        <>
          Noone found with the requested subject. Please come back later
        </>
      )}
    </div>
  );
};

const Page: React.FC<{ params: { requestid: string } }> = ({ params }) => {
  const [matchedRequests, setMatchedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useSigner();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/request/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ requestId: params.requestid })
        });
        if (!response.ok) {
          const body = await response.json();
          toast.error(body.error);
        } else {
          const data = await response.json();
          setMatchedRequests(data.matchedRequests);
        }
        setLoading(false);
      } catch (error: any) {
        toast.error(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.requestid, token]);

  return (
    <>
      {loading &&
        <div>Loading...</div>
      }
      {!loading && <div>
        <MatchedRequestsTable matchedRequests={matchedRequests} />
      </div>}
    </>
  );
};

export default Page;