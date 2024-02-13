import { usePublicKeyStore, useTriggerRefresh } from "@/stores/StateStore";
import { useEffect, useState } from "react";
import { getKaminoData } from "@/utils/SolanaUtils";
import { Input } from "./ui/input";
import { useApyStore, useTokenStore } from "@/stores/TokenStore";
import { toast } from "sonner";
import { tokens, truncate } from "@/utils/ConstUtils";

export function ParseDataDialog() {
  const [isLoading, setIsLoading] = useState(false);

  const { value: walletAddress, setValue: setWalletAddress } =
    usePublicKeyStore();
  const { forceAddHolding } = useTokenStore();
  const { forceAddApy } = useApyStore();
  const { triggerRefresh } = useTriggerRefresh();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        const data = await getKaminoData(walletAddress);

        const { borrowPositions, depositPositions } = data;
        for (const position of borrowPositions) {
          if (
            tokens.find((token) => token.name === position.ticker.toLowerCase())
          ) {
            const ticker = position.ticker.toLowerCase();
            // const adjustedAmount = Math.round(-100 * position.amount) / 100;
            // const adjustedAPY = Math.round(100 * position.APY) / 100;
            const adjustedAmount = -position.amount;
            const adjustedAPY = position.APY;

            forceAddApy(ticker, adjustedAPY);
            forceAddHolding(ticker, adjustedAmount);
          } else {
            toast.info(
              `${position.ticker} was not added since it does not contribute to your collateral assets.`
            );
          }
        }
        for (const position of depositPositions) {
          if (
            tokens.find((token) => token.name === position.ticker.toLowerCase())
          ) {
            const ticker = position.ticker.toLowerCase();
            // const adjustedAmount = Math.round(100 * position.amount) / 100;
            // const adjustedAPY = Math.round(100 * position.APY) / 100;
            const adjustedAmount = position.amount;
            const adjustedAPY = position.APY;

            forceAddApy(ticker, adjustedAPY);
            forceAddHolding(ticker, adjustedAmount);
          } else {
            toast.info(
              `${position.ticker} was not added since it does not contribute to your collateral assets.`
            );
          }
        }
        triggerRefresh();
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
    if (walletAddress.length > 0 && /^[a-zA-Z0-9]{44}$/.test(walletAddress)) {
      const dataPromise = fetchData();
      toast.promise(dataPromise, {
        loading: `Fetching data for ${truncate(walletAddress)}`,
        success: () => {
          return `Data fetched successfully for ${truncate(walletAddress)}`;
        },
        error: "Something went wrong! Please try again.",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  return (
    <Input
      placeholder="Enter wallet address"
      value={walletAddress}
      disabled={isLoading}
      onChange={(event) => setWalletAddress(event.target.value)}
      className="relative bg-background focus-visible:ring-ring/50 disabled:text-muted disabled:placeholder:text-muted-foreground disabled:bg-black disabled:border-muted/80  disabled:opacity-100"
    />
  );
}
