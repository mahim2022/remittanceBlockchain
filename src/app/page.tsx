"use client";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletButton } from '@rainbow-me/rainbowkit';
// import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import deployed from '../../contracts/deployed.json';
import { isAddress } from 'ethers';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'IN', name: 'India' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
];
const currencies = ['GBPT', 'EURC', 'USDC'];


function Page() {
  const [sourceCountry, setSourceCountry] = useState('US');
  const [destinationCountry, setDestinationCountry] = useState('GB');
  // const addRecentTransaction = useAddRecentTransaction();
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('GBPT');
  const [withdrawStatus, setWithdrawStatus] = useState('');

  const [walletBalance, setWalletBalance] = useState('');
  const [pendingBalance, setPendingBalance] = useState('');


   async function handleRemit() {
    if (!window.ethereum || !isConnected) return;
    setStatus('Processing...');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const usdc = new ethers.Contract(
      deployed.USDC,
      ['function approve(address,uint256) public returns (bool)'],
      signer
    );

    const remittance = new ethers.Contract(
      deployed.Remittance,
      [
        'function sendRemittance(string,string,address,uint256,bytes32) public',
      ],
      signer
    );

    try {
      const value = ethers.parseUnits(amount, 6);
      console.log(value);
      
    if (!isAddress(recipient)) {
  setStatus('❌ Invalid recipient address.');
  return;
}

      const approval= await usdc.approve(deployed.Remittance, value);
      await approval.wait();
      console.log('✅ USDC approved');
      const tx = await remittance.sendRemittance(
        sourceCountry,
        destinationCountry,
        recipient,
        value,
        ethers.id('frontend_tx_' + Date.now())
      );

      await tx.wait();
      setStatus('✅ Remittance sent successfully!');
    } catch (err: any) {
      console.error(err);
      setStatus('❌ Transaction failed.');
    }
  }

  return (
    <>

    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 12,
      }}
    >
      <ConnectButton />
      <WalletButton wallet="metamask" />
    </div>
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Connect Wallet Button
      <div className="flex justify-end mb-6">
        <ConnectButton />
      </div> */}

      {/* Card Container */}
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-4">💸 Send Remittance</h1>

        {!isConnected ? (
          <p className="text-gray-600">Please connect your wallet to continue.</p>
        ) : (
          <>
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full border p-2 mb-3 rounded"
            />
            <select
  className="w-full border p-2 mb-3 rounded"
  value={sourceCountry}
  onChange={(e) => setSourceCountry(e.target.value)}
>
  <option disabled>From Country</option>
  {countries.map((c) => (
    <option key={c.code} value={c.code}>{c.name}</option>
  ))}
</select>

<select
  className="w-full border p-2 mb-3 rounded"
  value={destinationCountry}
  onChange={(e) => setDestinationCountry(e.target.value)}
>
  <option disabled>To Country</option>
  {countries.map((c) => (
    <option key={c.code} value={c.code}>{c.name}</option>
  ))}
</select>
            <input
              type="text"
              placeholder="Amount in USDC"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            />
            <button
              onClick={handleRemit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Send Remittance
            </button>

            {status && (
              <p className="mt-4 text-sm text-gray-700 font-medium">{status}</p>
            )}
          </>
        )}
      </div>
       {/* Withdraw Card */}
<div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-6 mt-10">
  <h2 className="text-xl font-semibold mb-4">🏧 Withdraw Funds</h2>

  <select
    className="w-full border p-2 mb-4 rounded"
    value={withdrawCurrency}
    onChange={(e) => setWithdrawCurrency(e.target.value)}
  >
    {currencies.map((currency) => (
      <option key={currency} value={currency}>
        {currency}
      </option>
    ))}
  </select>

  <p className="mb-2 text-gray-600">Pending Balance: <strong>≈ {walletBalance} {withdrawCurrency}</strong></p>

  <button
    onClick={() => {
      setWithdrawStatus(`✅ Withdrew all available ${withdrawCurrency}`);
      console.log(address);
    }}
    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
  >
    Withdraw
  </button>

  {withdrawStatus && (
    <p className="mt-4 text-sm text-gray-700 font-medium">{withdrawStatus}</p>
  )}
</div>
    </div>
   

    
    </>
  );
}

export default Page;
