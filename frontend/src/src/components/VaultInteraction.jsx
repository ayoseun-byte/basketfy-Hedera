// src/components/VaultInteraction.jsx
import { ContractExecuteTransaction, ContractCallQuery, Client } from "@hashgraph/sdk";
import { useState } from "react";
import { useHashpackWallet } from "../hook/useHashpackWallet";

const CONTRACT_ID = "0.0.10069793"; // replace with your actual contract ID

export const VaultInteraction = () => {
  const { hashconnect, accountId, connected } = useHashpackWallet();
  const [balance, setBalance] = useState("");

  // Setup client as your teammate showed
  const client = Client.forTestnet();
  if (accountId) {
    client.setOperator(accountId, hashconnect.hbarProvider);
  }

  const queryBalance = async () => {
    try {
      const query = new ContractCallQuery()
        .setContractId(CONTRACT_ID)
        .setGas(100000)
        .setFunction("getVaultBalance");
      
      const res = await query.execute(client);
      const balance = res.getUint256(0).toString();
      setBalance(balance);
    } catch (error) {
      console.error("Query error:", error);
    }
  };

  const deposit = async (amount) => {
    try {
      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACT_ID)
        .setGas(200000)
        .setPayableAmount(amount)
        .setFunction("deposit");
      
      const response = await tx.execute(client);
      console.log("Deposit tx", response.transactionId.toString());
    } catch (error) {
      console.error("Deposit error:", error);
    }
  };

  return (
    <div>
      {connected ? (
        <>
          <p>Connected: {accountId}</p>
          <button onClick={queryBalance}>Query Vault Balance</button>
          <p>Vault Balance: {balance}</p>
          <button onClick={() => deposit(5)}>Deposit 5ℏ</button>
        </>
      ) : (
        <p>Connecting wallet...</p>
      )}
    </div>
  );
};