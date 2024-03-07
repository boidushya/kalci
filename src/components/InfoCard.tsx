import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TokenRow } from "./TokenRow";
import { useApyStore, useTokenStore } from "@/stores/TokenStore";
import {
  aggregatedMultiplier,
  calculatePoints,
  getTotalBorrowed,
  getTotalSupplied,
  calculateAirdrop,
  calculateAirdropUSD,
  calculateTokenPrice,
} from "@/utils/ConstUtils";
import { Button } from "./ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";
import { Input } from "./ui/input";
import { MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { useDebounce as _useDebounce } from "use-debounce";
import Amount from "./ui/amount";
import { usePublicKeyStore } from "@/stores/StateStore";

const Divider = ({ className }: { className?: string }) => (
  <div className={cn("border-t border-border", className || "")} />
);

const useDebounce = (value: number, delay = 500) => _useDebounce(value, delay);

export function InfoCard() {
  const { getTotalValue, holdings: _holdings } = useTokenStore();
  const { apyMap, modifyApy, getApy } = useApyStore();

  const publicKey = usePublicKeyStore();

  const [holdings] = _useDebounce(_holdings, 500);

  const [liquidity] = useDebounce(getTotalValue());

  const [approximateAirdropTokenValue, setApproximateAirdropTokenValue] =
    React.useState(0.3);

  const [totalSupplied] = useDebounce(getTotalSupplied());
  const [totalBorrowed] = useDebounce(getTotalBorrowed());

  const [totalAirdrop, setTotalAirdrop] = React.useState(0);
  const [totalAirdropUSD, setTotalAirdropUSD] = React.useState(0);

  const [boost] = useDebounce(aggregatedMultiplier() || 0.0);
  const [dailyPoints] = useDebounce(calculatePoints());

  const initialSupplyRows = holdings.filter((h) => h.balance > 0).length;
  const initialBorrowRows = holdings.filter((h) => h.balance < 0).length;

  const [supplyRows, setSupplyRows] = React.useState(
    initialSupplyRows === 0 ? 1 : initialSupplyRows
  );
  const [borrowRows, setBorrowRows] = React.useState(
    initialBorrowRows === 0 ? 1 : initialBorrowRows
  );

  React.useEffect(() => {
    holdings.forEach((h) => {
      getApy(h.token) === 0 && modifyApy(h.token);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdings]);

  React.useEffect(() => {
    if (publicKey.value) {
      setTotalAirdrop(calculateAirdrop());
      setTotalAirdropUSD(calculateAirdropUSD(approximateAirdropTokenValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey.value, approximateAirdropTokenValue]);

  React.useEffect(() => {
    if (publicKey.value) {
      setApproximateAirdropTokenValue(calculateTokenPrice());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey.value]);

  return (
    <ScrollArea
      customMaxWidth="max-h-[calc(100vh_-_68px)]"
      className="md:rounded-xl"
    >
      <Card className="shadow-xl w-full md:w-fit">
        <CardContent className="px-0 py-0 overflow-y-auto">
          <div className="grid grid-cols-none grid-rows-2 md:grid-rows-none md:grid-cols-2">
            <div className="p-0 border-b md:border-r md:border-b-0 border-border ">
              <div className="flex items-center justify-between px-4 my-4">
                <h2 className="text-lg font-medium text-muted-foreground">
                  Supplies
                </h2>
                <div className="flex items-center justify-center">
                  <Button
                    variant="outline"
                    className="px-3 rounded-r-none"
                    onClick={() => setSupplyRows(supplyRows - 1)}
                  >
                    <MinusIcon className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    placeholder="No. of Rows"
                    value={supplyRows}
                    onChange={(e) => setSupplyRows(Number(e.target.value))}
                    className="w-12 text-center rounded-none border-x-0"
                  />
                  <Button
                    variant="outline"
                    className="px-3 rounded-l-none"
                    onClick={() => setSupplyRows(supplyRows + 1)}
                  >
                    <PlusIcon className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Divider />
              <ScrollArea>
                <div className="px-4 py-6 space-y-4">
                  {Array(supplyRows)
                    .fill(null)
                    .map((_, i) => (
                      <TokenRow key={i} dataKey={i} />
                    ))}
                </div>
              </ScrollArea>
            </div>
            <div className="p-0">
              <div className="flex items-center justify-between px-4 my-4">
                <h2 className="text-lg font-medium text-muted-foreground">
                  Borrows
                </h2>
                <div className="flex items-center justify-center gap-0">
                  <Button
                    variant="outline"
                    className="px-3 rounded-r-none"
                    onClick={() => setBorrowRows(borrowRows - 1)}
                  >
                    <MinusIcon className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    placeholder="No. of Rows"
                    value={borrowRows}
                    onChange={(e) => setBorrowRows(Number(e.target.value))}
                    className="w-12 text-center rounded-none border-x-0"
                  />
                  <Button
                    variant="outline"
                    className="px-3 rounded-l-none"
                    onClick={() => setBorrowRows(borrowRows + 1)}
                  >
                    <PlusIcon className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Divider />
              <ScrollArea>
                <div className="px-4 py-6 space-y-4 max-h-60">
                  {Array(borrowRows)
                    .fill(null)
                    .map((_, i) => (
                      <TokenRow key={i} dataKey={i} isBorrow />
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <Divider />
          <div className="p-6 pt-4">
            <h2 className="mb-4 text-lg font-medium text-muted-foreground">
              Set APY
            </h2>
            {apyMap.length !== 0 ? (
              <ScrollArea>
                <div className="grid grid-flow-row grid-cols-1 md:grid-cols-3 gap-2 place-items-start">
                  {apyMap.map((a) => (
                    <div
                      key={a.token}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm border"
                    >
                      <h2 className="">{a.token.toUpperCase()}</h2>
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          type="number"
                          placeholder="APY"
                          value={a.apy}
                          onChange={(e) =>
                            modifyApy(a.token, Number(e.target.value))
                          }
                          className="w-16 h-8 text-right"
                        />
                        %
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-sm">
                Enter tokens to Supplies or Borrows to set custom APY
              </p>
            )}
          </div>
        </CardContent>
        <Divider />
        <CardFooter className="block px-0 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 md:px-6 px-0">
            <div className="py-6 md:pr-4 space-y-2 border-r-0 border-b md:border-b-0 md:border-r overflow-x-hidden md:px-0 px-6">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-muted-foreground">Daily Points</h2>
                <span className="flex font-mono">
                  <Amount value={dailyPoints} />
                </span>
              </div>
              <div className="flex items-center justify-between w-full">
                <h2 className="text-muted-foreground">Boost</h2>
                <span className="flex font-mono">
                  <Amount
                    value={boost}
                    decimalPlaces={1}
                    includeCommas={false}
                  />
                </span>
              </div>
            </div>
            <div className="py-6 pl-6 md:pr-0 pr-6 md:pl-4 space-y-2 overflow-x-hidden">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-muted-foreground">Total Supplied</h2>
                <span className="flex font-mono">
                  <Amount value={totalSupplied} includeDollar />
                </span>
              </div>
              <div className="flex items-center justify-between w-full">
                <h2 className="text-muted-foreground">Total Borrowed</h2>
                <span className="flex font-mono">
                  <Amount value={totalBorrowed} includeDollar />
                </span>
              </div>
            </div>
          </div>
          <Divider className="m-0" />
          {publicKey.value ? (
            <div>
              <div className="flex md:flex-row flex-col items-left justify-between w-full px-6 pt-4 pb-4 text-base my-0 md:my-2">
                <div className="w-full md:py-0 py-2 text-left max-w-[30rem]">
                  <p className="text-foreground text-bg md:text-inherit text-lg">
                    Approximate Airdrop
                  </p>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    Default $KMNO price calculated based on the average point
                    price on{" "}
                    <a
                      href="https://whales.market"
                      target="_blank"
                      className="underline hover:text-foreground transition-colors"
                    >
                      whales.market.
                    </a>{" "}
                    However you can adjust the price below.
                  </p>
                </div>
                <div className="flex flex-row">
                  <div className="flex font-mono text-right md:flex-col flex-row md:mt-0 my-4 md:text-sm text-base">
                    <div className="flex md:justify-end gap-2 font-semibold overflow-hidden ">
                      <Amount value={totalAirdrop} /> $KMNO
                    </div>
                    <span className="text-muted-foreground flex flex-row justify-end overflow-hidden">
                      (<Amount value={totalAirdropUSD} includeDollar />)
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between px-6 py-2 pr-2 text-sm border-t">
                  <h2 className="">$KMNO</h2>
                  <div className="flex items-center justify-center gap-2 pr-2">
                    $
                    <Input
                      type="number"
                      placeholder="$KNMO"
                      value={approximateAirdropTokenValue}
                      onChange={(e) =>
                        setApproximateAirdropTokenValue(Number(e.target.value))
                      }
                      className="w-24 h-8 text-right "
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full px-6 py-4 text-base">
              <span className="w-full text-muted-foreground">
                Enter an address to calculate airdrop
              </span>
            </div>
          )}
          <Divider className="!my-0" />
          <div className="flex items-center justify-between w-full px-6 pt-4 text-base">
            <h2 className="text-muted-foreground">Total Available Liquidity</h2>
            <span className="flex font-mono">
              <Amount value={liquidity} includeDollar />
            </span>
          </div>
        </CardFooter>
      </Card>
    </ScrollArea>
  );
}
