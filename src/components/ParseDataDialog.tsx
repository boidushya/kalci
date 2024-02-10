import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useParseDialogStore, useTriggerRefresh } from "@/stores/StateStore";
import { useEffect, useState } from "react";
import { getKaminoData } from "@/utils/SolanaUtils";
import { Input } from "./ui/input";
import { useApyStore, useTokenStore } from "@/stores/TokenStore";
import { toast } from "sonner";
import { tokens, truncate } from "@/utils/ConstUtils";

function Content() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { forceAddHolding } = useTokenStore();
  const { forceAddApy } = useApyStore();
  const { setOpen } = useParseDialogStore();
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
            const adjustedAmount = Math.round(-100 * position.amount) / 100;
            const adjustedAPY = Math.round(100 * position.APY) / 100;

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
            const adjustedAmount = Math.round(100 * position.amount) / 100;
            const adjustedAPY = Math.round(100 * position.APY) / 100;

            forceAddApy(ticker, adjustedAPY);
            forceAddHolding(ticker, adjustedAmount);
          } else {
            toast.info(
              `${position.ticker} was not added since it does not contribute to your collateral assets.`
            );
          }
        }
        setOpen(false);
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
    <div className="py-0">
      <Input
        placeholder="Enter wallet address"
        value={walletAddress}
        disabled={isLoading}
        onChange={(event) => setWalletAddress(event.target.value)}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        Enter your wallet address for{" "}
        <a
          className="underline transition-colors hover:text-primary underline-offset-2 hover:decoration-primary/100 decoration-primary/25"
          href="https://kamino.finance"
          target="_blank"
        >
          Kamino
        </a>{" "}
        and we will parse all data for you
      </p>
    </div>
  );
}

export function ParseDataDialog() {
  const { open, setOpen } = useParseDialogStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = "Parse Data";
  const description = "Automatically parse your Kamino data";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="flex items-center">
              {description}
            </DialogDescription>
          </DialogHeader>
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className="flex items-center">
            {description}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
