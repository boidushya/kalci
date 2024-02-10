// https://github.com/Kamino-Finance/klend-sdk/blob/49393a7c6254a14e8e410b54a9795de00df68519/tests/farms_tests/init_refresh_farm_deposit_borrow_and_repay_withdraw.test.ts#L281
// https://station.jup.ag/docs/apis/price-api

import { Connection, PublicKey } from "@solana/web3.js";
import {
  KaminoMarket,
  KaminoObligation,
  PROGRAM_ID,
  VanillaObligation,
  calculateAPYFromAPR,
} from "@hubbleprotocol/kamino-lending-sdk";

const KAMINO_PUBLIC_KEY = "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";

const getPriceData = async (token: string) => {
  try {
    const apiURL = `https://price.jup.ag/v4/price?ids=${token}`;
    const response = await fetch(apiURL);
    const { data } = await response.json();

    return {
      price: data[token].price,
      mintSymbol: data[token].mintSymbol,
    };
  } catch (e) {
    throw new Error("Price data not found for token: " + token);
  }
};

const getConnection = () => {
  const RPC_URL = import.meta.env.VITE_RPC_URL;
  if (!RPC_URL) {
    throw new Error("RPC_URL is not defined");
  }
  return new Connection(RPC_URL);
};

const getObligations = async (publicKey: string, market: KaminoMarket) => {
  const obligations = await market.getObligationByWallet(
    new PublicKey(publicKey),
    new VanillaObligation(PROGRAM_ID)
  );
  if (!obligations) {
    throw new Error("Obligations not found");
  }
  return obligations;
};

const getDepositPositions = async (
  obligations: KaminoObligation,
  market: KaminoMarket
) => {
  const deposits = obligations.getDeposits();

  const result = await Promise.all(
    deposits.map(async (deposit) => {
      const reserve = market.getReserveByAddress(deposit.reserveAddress);
      if (!reserve) throw new Error("Reserve not found");

      const currentUtilization = reserve?.calculateUtilizationRatio();
      const APR = reserve?.calculateBorrowAPR() * currentUtilization;
      const APY = calculateAPYFromAPR(APR) * 100;

      const token = deposit.mintAddress.toString();

      const amount = deposit.marketValueRefreshed.toDecimalPlaces(2).toNumber();

      const ticker = await getPriceData(token).then((data) => data.mintSymbol);

      const result = {
        ticker,
        amount,
        APY,
      };
      return result;
    })
  );

  return result;
};

const getBorrowPositions = async (
  obligations: KaminoObligation,
  market: KaminoMarket
) => {
  const borrows = obligations.getBorrows();

  const result = await Promise.all(
    borrows.map(async (borrow) => {
      const reserve = market.getReserveByAddress(borrow.reserveAddress);
      if (!reserve) throw new Error("Reserve not found");

      const APR = reserve?.calculateBorrowAPR();
      const APY = calculateAPYFromAPR(APR) * 100;

      const token = borrow.mintAddress.toString();

      const amount = borrow.marketValueRefreshed.toDecimalPlaces(2).toNumber();

      const ticker = await getPriceData(token).then((data) => data.mintSymbol);

      const result = {
        ticker,
        amount,
        APY,
      };
      return result;
    })
  );

  return result;
};

export const getKaminoData = async (publicKey: string) => {
  const connection = getConnection();

  const market = await KaminoMarket.load(
    connection,
    new PublicKey(KAMINO_PUBLIC_KEY)
  );
  if (!market) {
    throw new Error("Market not found");
  }

  const obligations = await getObligations(publicKey, market);

  const borrowPositions = await getBorrowPositions(obligations, market);
  const depositPositions = await getDepositPositions(obligations, market);

  return {
    borrowPositions,
    depositPositions,
  };
};
