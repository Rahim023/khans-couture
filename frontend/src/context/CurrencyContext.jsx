import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [country, setCountry] = useState(
    localStorage.getItem("country") || "Canada"
  );

  const [currency, setCurrency] = useState("CAD");

  // Conversion rates (INR → TARGET)
  const rates = {
    CAD: 1 / 62, // INR → CAD
    USD: 0.75 / 62, // INR → USD
    INR: 1, // INR stays INR
  };

  // Currency symbols
  const symbols = {
    CAD: "CA$",
    USD: "$",
    INR: "₹",
  };

  useEffect(() => {
    if (country === "Canada") setCurrency("CAD");
    else if (country === "USA") setCurrency("USD");
    else if (country === "India") setCurrency("INR");

    localStorage.setItem("country", country);
  }, [country]);

  // Convert INR → selected currency
  function convertPrice(inrPrice) {
    return (inrPrice * rates[currency]).toFixed(2);
  }

  return (
    <CurrencyContext.Provider
      value={{
        country,
        setCountry,
        currency,
        currencySymbol: symbols[currency], // ✅ ADDED
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
