"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react";

type SignerContextType = {
    token?: string;
    setToken: (token: string) => void;
}

const SignerContext = createContext<SignerContextType>({} as any);

const useSigner = () => useContext(SignerContext);

export const SignerProvider = ({ children }: { children: ReactNode }) => {
    const [token, setTokenState] = useState("");

    const setToken = (newToken: string) => {
        setTokenState(newToken);
        if (typeof window !== "undefined" && window.localStorage) {
            if (newToken.length === 0) {
                window.localStorage.removeItem('token');
            } else {
                window.localStorage.setItem('token', newToken);
            }
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined" && window.localStorage) {
            const value = window.localStorage.getItem("token") || "";
            console.log(value);
            setTokenState(value);
        }
    }, []);

    const contextValue = { token, setToken };
    return (
        <SignerContext.Provider value={contextValue}>
            {children}
        </SignerContext.Provider>
    );
}

export default useSigner;
