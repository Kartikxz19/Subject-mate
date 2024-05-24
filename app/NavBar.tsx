"use client";

import { useEffect, useState } from "react";
import useSigner from "./state";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SwapLogo from "./../public/swap-logo.svg"

const NavBar: React.FC = () => {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<string | null>(null);
  const { token, setToken } = useSigner();

  useEffect(() => {
    const verifyToken = async () => {
      if (token && token.length > 0) {
        try {
          const response = await fetch('/api/auth/verifyToken', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!response.ok) {
            setToken("");
          }
          const data = await response.json();
          setEnrollment(data.enrollment);
        } catch (error) {
          console.error('Token verification failed:', error);
          setEnrollment(null);
        }
      }
    };
    verifyToken();
  }, [token, setToken]);

  const handleLogout = () => {
    setToken("");
    setEnrollment(null);
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <div className="fixed top-0 w-full bg-black h-16 px-4 flex justify-between items-center ">

        <div className="text-white text-xl font-bold flex flex-row items-center">
          <Image src={SwapLogo} height={40} width={40} alt="Logo" className="inline mr-4" />
          Elective Swap Finder
        </div>
        <div className="flex space-x-4 items-center">
          {enrollment ? (
            <>
              <div className="text-white font-medium">Enrollment: {enrollment}</div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default NavBar;