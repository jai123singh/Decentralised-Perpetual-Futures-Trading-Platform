import { createContext, useContext } from "react";

const TradeContext = createContext(null);

export const TradeProvider = ({ children, value }) => {
  return (
    <TradeContext.Provider value={value}>{children}</TradeContext.Provider>
  );
};

export const useTrade = () => useContext(TradeContext);
