import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext;

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [seller, setIsSeller] = useState(false);

  const value = { navigate, user, setUser, seller, setIsSeller };

  return <AppContext.Provier value={value}>{children}</AppContext.Provier>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
