// src/hooks/useHashpackWallet.js
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setWalletConnected,
  setWalletAddress,
  setFormattedAddress,
  setWalletName,
} from "../store/store";
import { HashConnect } from "hashconnect";

export const useHashpackWallet = () => {
  const [hashconnect] = useState(new HashConnect());
  const [pairingData, setPairingData] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // Must include URL for v3
  const appMetadata = {
    name: "Basketfy Vault dApp",
    description: "Interact with Vault smart contract on Hedera",
    icon: "https://basketfy.app/icon.png",
    url: "https://basketfy.app",
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return addr.length > 8 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;
  };

  const handleConnection = (pairing) => {
    setPairingData(pairing);
    if (pairing.accountIds && pairing.accountIds.length > 0) {
      setAccountId(pairing.accountIds[0]);
      setConnected(true);

      dispatch(setWalletConnected(true));
      dispatch(setWalletAddress(pairing.accountIds[0]));
      dispatch(setFormattedAddress(formatAddress(pairing.accountIds[0])));
      dispatch(setWalletName("Hashpack"));

      // Save pairing info locally
      localStorage.setItem("hashpackData", JSON.stringify(pairing));
    }
  };

  const connect = async () => {
    setLoading(true);
    try {
      // 1️⃣ Initialize HashConnect
      await hashconnect.init(appMetadata, "testnet", false);

      // 2️⃣ Listen for pairing events
      hashconnect.pairingEvent.on((pairing) => {
        console.log(" Paired:", pairing);
        handleConnection(pairing);
      });

      // 3️⃣ Restore previous pairing if exists
      const saved = localStorage.getItem("hashpackData");
      if (saved) {
        const parsed = JSON.parse(saved);
        handleConnection(parsed);
        setLoading(false);
        return;
      }

      // 4️⃣ Open HashPack to connect
      await hashconnect.connectToLocalWallet();
    } catch (err) {
      console.error(" Hashpack connection failed:", err);
      alert(
        "Failed to connect. Make sure HashPack is installed and unlocked."
      );
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem("hashpackData");
    setPairingData(null);
    setAccountId(null);
    setConnected(false);

    dispatch(setWalletConnected(false));
    dispatch(setWalletAddress(""));
    dispatch(setFormattedAddress(""));
    dispatch(setWalletName(""));
  };

  // Restore pairing on page load
  useEffect(() => {
    const saved = localStorage.getItem("hashpackData");
    if (saved) {
      const parsed = JSON.parse(saved);
      handleConnection(parsed);
    }
  }, []);

  return {
    hashconnect,
    accountId,
    connected,
    loading,
    connect,
    disconnect,
    formatAddress,
  };
};
