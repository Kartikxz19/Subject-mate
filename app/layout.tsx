import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SignerProvider } from "./state";
import { Slide, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "./NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elective Swap Finder",
  description: "A simple app to find someone with whom you could swap your elective subjects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SignerProvider>
          <div className="app-container">
            <NavBar />
            <div className="app-content ">
              {children}
            </div>
            <ToastContainer
              position="bottom-center"
              autoClose={1000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Slide}
            />
          </div>
        </SignerProvider >
      </body>
    </html>
  );
}
