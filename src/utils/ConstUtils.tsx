import {
  IAPYStore,
  ITokenStore,
  useApyStore,
  useTokenStore,
} from "@/stores/TokenStore";

const apyStore = useApyStore as unknown as { getState: () => IAPYStore };
const apyStoreState = apyStore?.getState();

const tokenStore = useTokenStore as unknown as { getState: () => ITokenStore };

export const tokens = [
  {
    name: "usdc",
    boost_deposit: 3,
    boost_borrow: 5,
    borrow_factor: 1,
    type: "stable",
    // isSpecial: true,
  },
  {
    name: "usdt",
    boost_deposit: 3,
    boost_borrow: 5,
    borrow_factor: 1,
    type: "stable",
    // isSpecial: true,
  },
  {
    name: "usdh",
    boost_deposit: 3,
    boost_borrow: 5,
    borrow_factor: 1,
    type: "stable",
    // isSpecial: true,
  },
  {
    name: "uxd",
    boost_deposit: 1,
    boost_borrow: 1,
    borrow_factor: 1,
    type: "stable",
    // isSpecial: true,
  },
  {
    name: "sol",
    boost_deposit: 5,
    boost_borrow: 3,
    borrow_factor: 1.25,
    type: "other",
    // isSpecial: true,
  },
  {
    name: "bsol",
    boost_deposit: 1,
    boost_borrow: 1,
    borrow_factor: 1.25,
    type: "lst",
    // isSpecial: false,
  },
  {
    name: "jitosol",
    boost_deposit: 1,
    boost_borrow: 1,
    borrow_factor: 1.25,
    type: "lst",
    // isSpecial: false,
  },
  {
    name: "msol",
    boost_deposit: 1,
    boost_borrow: 1,
    borrow_factor: 1.25,
    type: "lst",
    // isSpecial: false,
  },
];

export const truncate = (str: string, n = 4) => {
  return str.length > n
    ? str.slice(0, n - 1) + "..." + str.slice(str.length - n)
    : str;
};

export const getTokenType = (token: string) => {
  const tokenInfo = tokens.find((t) => t.name === token);
  return tokenInfo?.type;
};

export const getTokenBoost = (token: string, isBorrow: boolean) => {
  const tokenInfo = tokens.find((t) => t.name === token);
  return isBorrow ? tokenInfo?.boost_borrow : tokenInfo?.boost_deposit;
}

export const getBorrowFactor = (token: string) => {
  const tokenInfo = tokens.find((t) => t.name === token);
  return tokenInfo?.borrow_factor;
};

export const calculatePoints = (): number => {
  const holdings = tokenStore?.getState().holdings;
  // const netTotal = tokenStore?.getState().getTotalValue();
  // const totalBorrows = holdings.filter((h) => h.balance < 0).reduce((acc, h) => acc + Math.abs(h.balance), 0);
  const LSTs = holdings.filter((t) => getTokenType(t.token) === "lst");
  const stableTokens = holdings.filter((t) => getTokenType(t.token) === "stable");
  const otherTokens = holdings.filter((t) => getTokenType(t.token) === "other");
  
  const LSTSupplied = LSTs.filter((h) => h.balance > 0).reduce((acc, h) => acc + h.balance, 0);
  const LSTBorrowed = LSTs.filter((h) => h.balance < 0).reduce((acc, h) => acc + Math.abs(h.balance), 0);
  const stableSupplied = stableTokens.filter((h) => h.balance > 0).reduce((acc, h) => acc + h.balance, 0);
  const stableBorrowed = stableTokens.filter((h) => h.balance < 0).reduce((acc, h) => acc + Math.abs(h.balance), 0);
  const onlyLSTs = otherTokens.length === 0 && stableTokens.length === 0;
  const onlyStables = otherTokens.length === 0 && LSTs.length === 0;

  // scenario 1: only LSTs on both sides
  if (onlyLSTs) {
    const supplyPoints = LSTs.filter((h) => h.balance > 0).reduce((acc, h) => acc + h.balance * (getTokenBoost(h.token, h.balance < 0) || 1), 0);
    const borrowPoints = Math.abs(LSTs.filter((h) => h.balance < 0).reduce((acc, h) => acc + h.balance * (getTokenBoost(h.token, h.balance < 0) || 1), 0));
    return supplyPoints - borrowPoints;
  }
  // scenario 2: only stables on both sides
  if (onlyStables) {
    const supplyPoints = stableTokens.filter((h) => h.balance > 0).reduce((acc, h) => acc + h.balance * (getTokenBoost(h.token, h.balance < 0) || 1), 0);
    const borrowPoints = Math.abs(stableTokens.filter((h) => h.balance < 0).reduce((acc, h) => acc + h.balance * (getTokenBoost(h.token, h.balance < 0) || 1), 0));
    return supplyPoints - borrowPoints;
  }
  // scenario 3: lsts on either side, along with other tokens
  let LSTPoints = 0;
  let stablePoints = 0;
  if (LSTSupplied > 0 && LSTBorrowed > 0) {
    if (LSTSupplied > LSTBorrowed) {
      const globalRate = 1;
      const netValue = LSTSupplied - LSTBorrowed;
      LSTPoints = netValue * globalRate;
    } else {
      const netValue = LSTBorrowed - LSTSupplied;
      const globalRate = 1;
      LSTPoints = netValue * globalRate;
    }
  } else {
    LSTs.forEach((h) => {
      LSTPoints += Math.abs(h.balance) * (getTokenBoost(h.token, h.balance < 0) || 1);
    });
  }
  // // scenario 4: stables on either side, along with other tokens
  if (stableSupplied > 0 && stableBorrowed > 0) {
    if (stableSupplied > stableBorrowed) {
      const netValue = stableSupplied - stableBorrowed;
      const globalRate = 3;
      stablePoints = netValue * globalRate;
    } else {
      const netValue = stableBorrowed - stableSupplied;
      const globalRate = 5;
      stablePoints = netValue * globalRate;
    }
  } else {
    stableTokens.forEach((h) => {
      stablePoints += Math.abs(h.balance) * (getTokenBoost(h.token, h.balance < 0) || 1);
    });
  }
  // scenario 5: default
  let points = 0;
  otherTokens.forEach((h) => {
    points += Math.abs(h.balance) * (getTokenBoost(h.token, h.balance < 0) || 1);
  });
  const tot = points + LSTPoints + stablePoints;
  return tot;
}
export const aggregatedMultiplier = () => {
  const points = calculatePoints();
  const liquidity = tokenStore?.getState().getTotalValue();
  return points / liquidity;
};

export const getTotalBorrowed = () => {
  const holdings = tokenStore?.getState().holdings;

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
  const holdings = tokenStore?.getState().holdings;
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

  //   console.log("borrowedAPY", borrowedAPY);
  //   console.log("suppliedAPY", suppliedAPY);

  const totalDebt =
    totalSupplied * (1 + suppliedAPY / 100) -
    totalBorrowed * (1 + borrowedAPY / 100);

  return Number(totalDebt.toFixed(2));
};

export const getTotalSupplied = () => {
  const holdings = tokenStore?.getState().holdings;

  return holdings.reduce((acc, h) => {
    if (h.balance > 0) {
      return acc + h.balance;
    }
    return acc;
  }, 0);
};
