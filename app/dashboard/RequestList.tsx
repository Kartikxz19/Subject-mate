import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import React, { useState } from 'react';
import useSigner from '../state';

export type Preference = {
  preference_number: number;
  subject_name: string;
  subject_id: number;
};

export type Request = {
  id: number;
  category_id: number;
  subject_id: number;
  category_name: string;
  subject_name: string;
  processed: boolean;
  other_std_id?: number;
  preferences: Preference[];
};


export type GetRequestsResponse = {
  requests: Request[];
};

export type RequestListProps = {
  requests: Request[];
  refresh : () => void;
};

const RequestList: React.FC<RequestListProps> = ({ requests, refresh }) => {
  const [otherEnrollment, setOtherEnrollment] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedAction, setSelectedAction] = useState<number | null>(null); // Initialize with null or a default value
  const router = useRouter();
  const { token } = useSigner();

  const confirmModification = async () => {
    try {
      if (selectedAction === 1) {
        const response = await fetch(`/api/request/delete`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ requestId: selectedRequest?.id }),
        });
        if (!response.ok) {
          const body = await response.json();
          toast.error(body.error);
        } else {
          toast.success('Request deleted successfully');
        }
      } else if (selectedAction === 2) {
        if (otherEnrollment.trim() === '') {
          toast.error('Please enter other enrollment number');
          return;
        }
        const response = await fetch(`/api/request/final`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ other_enrollment: otherEnrollment, requestId: selectedRequest?.id }),
        });
        if (!response.ok) {
          const body = await response.json();
          toast.error(body.error);
        } else {
          toast.success('Request marked as done successfully');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to perform modification');
    } finally {
      setSelectedRequest(null);
    }
    refresh();
  };


  const handleClick = (request: Request) => {
    setSelectedRequest(request);
    setSelectedAction(0); // Reset selected action when a new request is selected
  };

  const handleDelete = async (request: Request) => {
    setSelectedRequest(request);
    setSelectedAction(1); // Set selected action to 0 for delete
  };

  const handleMarkAsDone = async (request: Request) => {
    setSelectedRequest(request);
    setSelectedAction(2); // Set selected action to 1 for mark as done
  };

  const navigateToMatchPage = (requestId: number) => {
    router.push(`/dashboard/match/${requestId}`);
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map(request => (
            <tr key={request.id} className="cursor-pointer hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{request.category_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{request.subject_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.processed ? "Done" : (
                  <button
                    onClick={() => navigateToMatchPage(request.id)} // Call function with request ID
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Match
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => handleClick(request)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  View Details
                </button>
                {
                  !request.processed && (
                    <>
                      <button
                        onClick={() => handleDelete(request)} // Call function to delete request
                        className="text-red-600 hover:text-red-900 mr-4"
                      >
                        Delete Request
                      </button>
                      <button
                        onClick={() => handleMarkAsDone(request)} // Call function to mark request as done
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark as Done
                      </button>
                    </>
                  )
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRequest && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {
                  (selectedAction === 0) && (<>
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                        {/* Heroicon name: outline/check */}
                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          Preferences for {selectedRequest.category_name} - {selectedRequest.subject_name}
                        </h3>
                        <div className="mt-2">
                          <ul role="list" className="divide-y divide-gray-200">
                            {selectedRequest.preferences.map(preference => (
                              <li key={preference.preference_number} className="py-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900">{preference.subject_name}</span>
                                  <span className="text-xs text-gray-500">Preference {preference.preference_number}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>)
                }
                {
                  (selectedAction === 1) && (<>
                    <div className="sm:flex sm:items-start">
                      Are you sure you want to delete this request?
                    </div>
                  </>)
                }

                {(selectedAction === 2) && (
                  <>
                    <label htmlFor="otherEnrollment" className="block text-sm font-medium text-gray-700 mt-4">Enter Other Student Enrollment</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="otherEnrollment"
                        value={otherEnrollment}
                        onChange={(e) => setOtherEnrollment(e.target.value)}
                        className="block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {
                  (selectedAction === 1 || selectedAction === 2) && (<>
                    <div className="sm:flex sm:items-start">
                      <button onClick={confirmModification} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm">
                        Confirm
                      </button>
                    </div>
                    <div className="sm:flex sm:items-start">
                      <button onClick={() => setSelectedRequest(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                        Cancel
                      </button>
                    </div>
                  </>)
                }
                {
                  (selectedAction === 0) && (<>
                    <div className="sm:flex sm:items-start">
                      <button onClick={() => setSelectedRequest(null)} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm">
                        Close
                      </button>
                    </div>
                  </>)
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;
