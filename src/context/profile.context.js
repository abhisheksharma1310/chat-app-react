import React, { createContext } from "react";

const ProfileContext = createContext();

export const ProfileProvider = ({ children}) => {
    return <ProfileContext.Provider>{children}</ProfileContext.Provider>;
}