import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmiConfig";
import Background from "./UIComponents/MainComponents/Background/Background";
import { Toaster } from "sonner";

const queryClient = new QueryClient();
export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "#3a3a3a",
              color: "#ffffff",
              border: "1px solid #333",
            },
          }}
        />
        <Background />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
