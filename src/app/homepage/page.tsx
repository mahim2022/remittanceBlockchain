"use client";
import "../globals.css";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletButton } from '@rainbow-me/rainbowkit';
// import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import deployed from '../../../contracts/deployed.json';
import { isAddress } from 'ethers';
import { useBalance } from 'wagmi';




const countries = [
 { code: "US", name: "United States", stablecoin: "USDC" },
  { code: "EU", name: "European Union", stablecoin: "EURC" },
  { code: "GB", name: "United Kingdom", stablecoin: "GBPT" },
  { code: "SG", name: "Singapore", stablecoin: "XSGD" },
  { code: "JP", name: "Japan", stablecoin: "JPYC" },
  { code: "MY", name: "Malaysia", stablecoin: "MYRC" },
];
const currencies = ['GBPT', 'EURC', 'USDC'];


function homepage() {
  const [sourceCountry, setSourceCountry] = useState('US');
  const [destinationCountry, setDestinationCountry] = useState('GB');
  // const addRecentTransaction = useAddRecentTransaction();
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('GBPT');
  const [withdrawStatus, setWithdrawStatus] = useState('');
  const { data, isError, isLoading } = useBalance({address})
  // const [walletBalance, setWalletBalance] = useState("");
  // const { data: walletClient } = useWalletClient();

// async function handleRemit() {
//   if (!walletClient || !isConnected) {
//     setStatus('❌ Wallet not connected.');
//     return;
//   }

//   if (!isAddress(recipient)) {
//     setStatus('❌ Invalid recipient address.');
//     return;
//   }

//   if (!amount) {
//     setStatus('❌ Amount required.');
//     return;
//   }

//   try {
//     setStatus('⏳ Sending transaction...');

//     const hash = await writeContract(walletClient, {
//       address: deployed.Remittance as `0x${string}`,
//       abi: remittanceAbi.abi,
//       functionName: 'sendRemittance',
//       args: [
//         sourceCountry,
//         destinationCountry,
//         recipient as `0x${string}`,
//         parseUnits(amount, 6), // assuming USDC has 6 decimals
//         `0x${Buffer.from(`frontend_tx_${Date.now()}`).toString('hex').padEnd(64, '0')}` as `0x${string}`,
//       ],
//     });
//      const { data, isLoading, isSuccess, write } = useWriteContract({
//     address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
//     abi: wagmigotchiABI,
//     functionName: 'feed',
//   })

//     setStatus('📡 Waiting for confirmation...');

//     // const receipt = await waitForTransactionReceipt(walletClient, { hash });

//     // if (receipt.status === 'success') {
//     //   setStatus('✅ Remittance sent successfully!');
//     // } else {
//     //   setStatus('⚠️ Transaction reverted.');
//     // }
//   } catch (err: any) {
//     console.error(err);
//     setStatus(`❌ Error: ${err.shortMessage || err.message}`);
//   }
// }
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
      // const value = ethers.parseEther(amount.toString());

      console.log(value);
      
    if (!isAddress(recipient)) {
  setStatus('❌ Invalid recipient address.');
  return;
}

      const approval= await usdc.approve(deployed.Remittance, value);
      await approval.wait();
      console.log('✅ USDC approved');
      console.log(sourceCountry,destinationCountry);
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

  function withdraw(){

  }

  return (
    < div >

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

  <p className="mb-2 text-gray-600">Pending Balance: <strong>≈ {data?.value} {withdrawCurrency}</strong></p>

  {/* <button
    onClick={() => {
      withdraw();
    }}
    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
  >
    Withdraw
  </button> */}

  <button className="btn w-64 rounded-full">Button</button>


  {withdrawStatus && (
    <p className="mt-4 text-sm text-gray-700 font-medium">{withdrawStatus}</p>
  )}
</div>
    </div>
   

    
    </div>
  );
}

export default homepage;
