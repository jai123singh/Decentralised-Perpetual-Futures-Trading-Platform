import * as React from "react";
import { Connector, useConnect } from "wagmi";
import "./App.css";

export const WalletOptions = ({ className }: { className: "" }) => {
  const { connectors, connect } = useConnect();

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
      className={className}
    />
  ));
};

function WalletOption({
  connector,
  onClick,
  className,
}: {
  connector: Connector;
  onClick: () => void;
  className: "";
}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <button disabled={!ready} onClick={onClick} className={className}>
      {connector.name}
    </button>
  );
}
