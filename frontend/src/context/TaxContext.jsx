import React, { createContext, useContext, useState, useEffect } from "react";

const TaxContext = createContext();

export const TaxProvider = ({ children }) => {
  const [showTax, setShowTax] = useState(() => {
    return localStorage.getItem("showTax") === "true";
  });

  useEffect(() => {
    localStorage.setItem("showTax", showTax ? "true" : "false");
  }, [showTax]);

  const toggleShowTax = () => setShowTax(prev => !prev);

  return (
    <TaxContext.Provider value={{ showTax, toggleShowTax }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => useContext(TaxContext);
