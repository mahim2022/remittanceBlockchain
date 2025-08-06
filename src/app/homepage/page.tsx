"use client";
import React, { useState } from 'react';
import { ConnectButton, WalletButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { ethers, isAddress } from 'ethers';
import deployed from '../../../contracts/deployed.json';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Divider,
} from '@mui/material';
import SearchAppBar from '../../../components/SearchAppBar';

const countries = [
  { code: "US", name: "United States", stablecoin: "USDC" },
  { code: "EU", name: "European Union", stablecoin: "EURC" },
  { code: "GB", name: "United Kingdom", stablecoin: "GBPT" },
  { code: "SG", name: "Singapore", stablecoin: "XSGD" },
  { code: "JP", name: "Japan", stablecoin: "JPYC" },
  { code: "MY", name: "Malaysia", stablecoin: "MYRC" },
];

const currencies = ['GBPT', 'EURC', 'USDC',"XSGD","JPYC","MYRC"];

function Homepage() {
  const [sourceCountry, setSourceCountry] = useState('US');
  const [destinationCountry, setDestinationCountry] = useState('GB');
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('GBPT');
  const [withdrawStatus, setWithdrawStatus] = useState('');
  const { data } = useBalance({ address });

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

      const approval = await usdc.approve(deployed.Remittance, value);
      await approval.wait();

      const tx = await remittance.sendRemittance(
        sourceCountry,
        destinationCountry,
        recipient,
        value,
        ethers.id('frontend_tx_' + Date.now())
      );

      await tx.wait();
      setStatus('✅ Remittance sent successfully!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Transaction failed.');
    }
  }
  



  async function handleWithdraw(currencyCode: string) {
  if (!window.ethereum || !isConnected) return;
  setStatus('Processing withdrawal...');

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const remittance = new ethers.Contract(
      deployed.Remittance,
      ['function withdrawRemittance(address) public',
      ], 
      signer
    );
    // const tokenAddress = await remittance.getStablecoinForCountry("US");
    const tokenAddress = deployed[withdrawCurrency as keyof typeof deployed];;
    
    if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
      setStatus('❌ Invalid token address.');
      return;
    }

    const tx = await remittance.withdrawRemittance(tokenAddress);

    await tx.wait();

    setStatus('✅ Withdrawal successful!');
  } catch (err) {
    console.error(err);
    setStatus('❌ Withdrawal failed.');
  }
}


  return (
    <>
    <SearchAppBar></SearchAppBar>
    <Container maxWidth="sm">
      {/* <Box display="flex" justifyContent="flex-end" my={2}>
        <ConnectButton />
        <WalletButton wallet="metamask" />
      </Box> */}

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          💸 Send Remittance
        </Typography>

        {!isConnected ? (
          <Typography color="text.secondary">Please connect your wallet to continue.</Typography>
        ) : (
          <>
            <TextField
              label="Recipient Address"
              variant="outlined"
              fullWidth
              margin="normal"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />

            <TextField
              select
              label="From Country"
              value={sourceCountry}
              onChange={(e) => setSourceCountry(e.target.value)}
              fullWidth
              margin="normal"
            >
              {countries.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="To Country"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              fullWidth
              margin="normal"
            >
              {countries.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Amount in USDC"
              variant="outlined"
              fullWidth
              margin="normal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleRemit}
            >
              Send Remittance
            </Button>

            {status && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                {status}
              </Typography>
            )}
          </>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mt: 5 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          🏧 Withdraw Funds
        </Typography>

        <TextField
          select
          label="Select Currency"
          value={withdrawCurrency}
          onChange={(e) => setWithdrawCurrency(e.target.value)}
          fullWidth
          margin="normal"
        >
          {currencies.map((currency) => (
            <MenuItem key={currency} value={currency}>
              {currency}
            </MenuItem>
          ))}
        </TextField>
        
          <TextField
    label="Amount"
    value={data?.value || ''}
    disabled
    fullWidth
    margin="normal"
    helperText="You will withdraw the full available amount"
  />


        <Typography sx={{ mb: 2 }} color="text.secondary">
          Pending Balance: <strong>≈ {data?.value} {withdrawCurrency}</strong>
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          sx={{ borderRadius: '999px' }}
          onClick={() => handleWithdraw(withdrawCurrency)}
        >
          Withdraw
        </Button>

        {withdrawStatus && (
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            {withdrawStatus}
          </Typography>
        )}
      </Paper>
    </Container></>
  );
  
}

export default Homepage;
