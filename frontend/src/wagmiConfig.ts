import { createConfig, http, webSocket } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { fallback } from "wagmi";

// It's better to use environment variables through import.meta.env in Vite
const HTTP_URL = import.meta.env.VITE_HTTP_RPC_URL;
const WS_URL = import.meta.env.VITE_WS_RPC_URL;

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: fallback([http(HTTP_URL), webSocket(WS_URL)]),
  },
});
