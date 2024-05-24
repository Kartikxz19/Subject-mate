"use client"

import { useRouter } from 'next/navigation';
import useSigner from './state';
import swaplogo from '../public/swap-logo.svg'
import emoji from '../public/emoji.png'
import Image from 'next/image'
export default function Home() {
  const { token } = useSigner();
  const router = useRouter();

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToLogin = () => {
    router.push('/auth/login');
  };

  const goToSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 p-6">
  <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
    <Image src={swaplogo} width={106} height={106} className='ml-auto mr-auto' alt='swap-logo'></Image>
    <h1 className="text-4xl font-extrabold text-indigo-600 mb-6 mt-4 ml-auto mr-auto text-center">Elective Swap Finder</h1>
    <p className="text-lg text-gray-700 text-center mb-4">
      What you can do here?
    </p>
    <Image src={emoji} width={106} height={106} className='ml-auto mr-auto' alt='emoji'></Image>
    <div className="text-lg text-gray-600 text-center mb-8 space-y-6">
      <div className="bg-gray-100 p-4 rounded-md shadow-inner">
        <p className="leading-relaxed">Simply login/signup and then, choose what elective you want to swap.</p>
      </div>
      <div className="bg-gray-100 p-4 rounded-md shadow-inner">
        <p className="leading-relaxed">Any match will be visible as soon as the other person registers their swap priorities.</p>
      </div>
      <div className="bg-gray-100 p-4 rounded-md shadow-inner">
        <p className="leading-relaxed">And voila! You can contact them on the spot!</p>
      </div>
      </div>
    {(token && token.length > 0) ? (
      <button
        onClick={goToDashboard}
        className="w-full py-3 px-6 bg-indigo-500 text-white rounded-md shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
      >
        Go to Dashboard
      </button>
    ) : (
      <div className='flex flex-row justify-around gap-2'>
        <button
        onClick={goToLogin}
        className="w-full py-3 px-6 bg-black text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
      >
        Go to Login
      </button>
      <button
      onClick={goToSignup}
      className="w-full py-3 px-6 bg-black text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
    >
      Go to SignUp
    </button>
      </div>
    )}
  </div>
</div>

  );
}
