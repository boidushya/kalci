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

export const calculatePoints = (
  holdings: { balance: number; token: string }[]
) => {
  return holdings.reduce((acc, h) => {
    const token = tokens.find((t) => t.name === h.token);
    if (!token) return acc;
    const multiplier = calculateMultiplier(token, h.balance < 0);
    return acc + h.balance * multiplier;
  }, 0);
};

export const aggregatedMultiplier = (
  holdings: {
    balance: number;
    token: string;
  }[]
) => {
  const totalValue = holdings.reduce((acc, h) => {
    const token = tokens.find((t) => t.name === h.token);
    if (!token) return acc;
    const multiplier = calculateMultiplier(token, h.balance < 0);
    return acc + h.balance * multiplier;
  }, 0);
  const totalSupply = holdings.reduce((acc, h) => acc + h.balance, 0);
  return (totalValue / totalSupply).toFixed(1);
};

export const getTotalBorrowed = (
  holdings: { balance: number; token: string }[]
) => {
  return Math.abs(
    holdings.reduce((acc, h) => {
      if (h.balance < 0) {
        return acc + h.balance;
      }
      return acc;
    }, 0)
  );
};

export const getTotalSupplied = (
  holdings: { balance: number; token: string }[]
) => {
  return holdings.reduce((acc, h) => {
    if (h.balance > 0) {
      return acc + h.balance;
    }
    return acc;
  }, 0);
};
