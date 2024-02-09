import {
  IAPYStore,
  ITokenStore,
  useApyStore,
  useTokenStore,
} from "@/stores/TokenStore";

const apyStore = useApyStore as unknown as { getState: () => IAPYStore };
const apyStoreState = apyStore?.getState();

const tokenStore = useTokenStore as unknown as { getState: () => ITokenStore };
const tokenStoreState = tokenStore?.getState();

export const tokens = [
  {
    name: "usdc",
    isSpecial: true,
  },
  {
    name: "usdt",
    isSpecial: true,
  },
  {
    name: "usdh",
    isSpecial: true,
  },
  {
    name: "uxd",
    isSpecial: true,
  },
  {
    name: "sol",
    isSpecial: true,
  },
  {
    name: "bsol",
    isSpecial: false,
  },
  {
    name: "jitosol",
    isSpecial: false,
  },
  {
    name: "msol",
    isSpecial: false,
  },
];

const calculateMultiplier = (
  token: { name: string; isSpecial: boolean },
  isBorrow: boolean
) => {
  if (token.isSpecial) {
    return isBorrow ? 3 : 5;
  }
  return 1;
};

export const calculatePoints = (): number => {
  const getApy = apyStoreState.getApy;
  const holdings = tokenStoreState.holdings;

  return holdings.reduce((acc, h) => {
    const token = tokens.find((t) => t.name === h.token);
    if (!token) return acc;

    const isBorrowing = h.balance < 0;
    const multiplier = calculateMultiplier(token, isBorrowing);
    const apy = getApy(h.token);

    // I might be grossly wrong about this apyBoost calculation, pls fix lol

    const apyBoost = apy > 0 ? 1 + ((isBorrowing ? 1 : -1) * apy) / 100 : 1;
    // const apyBoost = apy > 0 ? 1 : 1;

    return acc + h.balance * multiplier * apyBoost;
  }, 0);
};

export const aggregatedMultiplier = () => {
  const getApy = apyStoreState.getApy;
  const holdings = tokenStoreState.holdings;

  const totalValue = holdings.reduce((acc, h) => {
    const token = tokens.find((t) => t.name === h.token);
    if (!token) return acc;

    const isBorrowing = h.balance < 0;
    const multiplier = calculateMultiplier(token, isBorrowing);
    const apy = getApy(h.token);

    // I might be grossly wrong about this apyBoost calculation, pls fix lol

    const apyBoost = apy > 0 ? 1 + ((isBorrowing ? 1 : -1) * apy) / 100 : 1;
    // const apyBoost = apy > 0 ? 1 : 1;

    return acc + h.balance * multiplier * apyBoost;
  }, 0);

  const totalSupply = holdings.reduce((acc, h) => acc + h.balance, 0);
  return (totalValue / totalSupply).toFixed(1);
};

export const getTotalBorrowed = () => {
  const holdings = tokenStoreState.holdings;

  return Math.abs(
    holdings.reduce((acc, h) => {
      if (h.balance < 0) {
        return acc + h.balance;
      }
      return acc;
    }, 0)
  );
};

export const getTotalDebt = () => {
  const holdings = tokenStoreState.holdings;
  const getApy = apyStoreState.getApy;

  // total supplied * supplied APY - total borrowed * borrowed APY
  const totalBorrowed = getTotalBorrowed();
  const totalSupplied = getTotalSupplied();

  // borrowed APY = weighted APY percent of all borrowed tokens (tokenA * APY + tokenB * APY) / (tokenA + tokenB)
  // supplied APY = weighted APY percent of all supplied tokens (tokenA * APY + tokenB * APY) / (tokenA + tokenB)

  const borrowedAPY =
    (holdings.reduce((acc, h) => {
      if (h.balance < 0) {
        return acc + h.balance * (getApy(h.token) / 100);
      }
      return acc;
    }, 0) /
      totalBorrowed) *
    100;

  const suppliedAPY =
    (holdings.reduce((acc, h) => {
      if (h.balance > 0) {
        return acc + h.balance * (getApy(h.token) / 100);
      }
      return acc;
    }, 0) /
      totalSupplied) *
    100;

  console.log("borrowedAPY", borrowedAPY);
  console.log("suppliedAPY", suppliedAPY);

  const totalDebt =
    totalSupplied * (1 + suppliedAPY / 100) -
    totalBorrowed * (1 + borrowedAPY / 100);

  return Number(totalDebt.toFixed(2));
};

export const getTotalSupplied = () => {
  const holdings = tokenStoreState.holdings;

  return holdings.reduce((acc, h) => {
    if (h.balance > 0) {
      return acc + h.balance;
    }
    return acc;
  }, 0);
};
