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

const getUserPointsData = async (publicKey: string) => {
  try {
    const apiURL = `https://api.hubbleprotocol.io/points/users/${publicKey}/breakdown`;
    const response = await fetch(apiURL);
    const data = await response.json();

    return data;
  } catch (e) {
    throw new Error("User points data not found for address: " + publicKey);
  }
}

const getWhalesMarketData = async () => {
  try {
    const apiURL = `https://api.whales.market/tokens/token-preview?ids=efb29bef-8b97-4b72-b2b1-2448fb8e3429`;
    const response = await fetch(apiURL);
    const { data } = await response.json();
    
    const averageBid = data[0].average_bids;
    const averageAsk = data[0].average_asks;

    const averagePricePerPoint = (averageBid + averageAsk) / 2;
    return averagePricePerPoint;
  } catch (e) {
    throw new Error("Whales market data not found");
  }
}

const getTotalPointsData = async () => {
  try {
    const apiURL = `https://api.hubbleprotocol.io/points/metrics`;
    const response = await fetch(apiURL);
    const data = await response.json();

    return data;
  } catch (e) {
    throw new Error("Total points data not found");
  }
}

const getConnection = () => {
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
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

  console.log(market);

  const result = await Promise.all(
    borrows.map(async (borrow) => {
      const reserve = market.getReserveByAddress(borrow.reserveAddress);
      if (!reserve) throw new Error("Reserve not found");

      console.log(reserve);

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
  const userPointsData = await getUserPointsData(publicKey);
  const totalPointsData = await getTotalPointsData();
  const averagePricePerPoint = await getWhalesMarketData();

  const borrowPositions = await getBorrowPositions(obligations, market);
  const depositPositions = await getDepositPositions(obligations, market);

  return {
    borrowPositions,
    depositPositions,
    userPointsData,
    totalPointsData,
    averagePricePerPoint,
  };
};
