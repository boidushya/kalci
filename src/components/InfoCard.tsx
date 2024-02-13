import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TokenRow } from "./TokenRow";
import { useApyStore, useTokenStore } from "@/stores/TokenStore";
import {
  aggregatedMultiplier,
  calculatePoints,
  getTotalBorrowed,
  getTotalSupplied,
} from "@/utils/ConstUtils";
import { Button } from "./ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";
import { Input } from "./ui/input";
import { MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import AnimatedNumbers from "react-animated-numbers";
import { useDebounce as _useDebounce } from "use-debounce";

const Divider = ({ className }: { className?: string }) => (
  <div className={cn("border-t border-border", className || "")} />
);

const useDebounce = (value: number, delay = 500) => _useDebounce(value, delay);

export function InfoCard() {
  const { getTotalValue, holdings } = useTokenStore();
  const { apyMap, modifyApy, getApy } = useApyStore();

  const [liquidity] = useDebounce(getTotalValue());

  const [totalSupplied] = useDebounce(getTotalSupplied());
  const [totalBorrowed] = useDebounce(getTotalBorrowed());

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
        <CardFooter className="block px-0 space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 px-6">
            <div className="py-6 pr-0 md:pr-4 space-y-2 border-r-0 border-b md:border-b-0 md:border-r">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-muted-foreground">Daily Points</h2>
                <span className="flex font-mono">
                  <AnimatedNumbers
                    includeComma
                    transitions={(index) => ({
                      type: "spring",
                      duration: 0.2 + index * 0.1,
                    })}
                    animateToNumber={dailyPoints}
                  />
                </span>
              </div>
              <div className="flex items-center justify-between w-full">
                <h2 className="text-muted-foreground">Boost</h2>
                <span className="flex font-mono">
                  <AnimatedNumbers
                    includeComma
                    transitions={(index) => ({
                      type: "spring",
                      duration: 0.2 + index * 0.1,
                    })}
                    animateToNumber={boost}
                  />
                </span>
              </div>
            </div>
            <div className="py-6 pl-0 md:pl-4 space-y-2">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-muted-foreground">Total Supplied</h2>
                <span className="flex font-mono">
                  $
                  <AnimatedNumbers
                    includeComma
                    transitions={(index) => ({
                      type: "spring",
                      duration: 0.2 + index * 0.1,
                    })}
                    animateToNumber={totalSupplied}
                  />
                </span>
              </div>
              <div className="flex items-center justify-between w-full">
                <h2 className="text-muted-foreground">Total Borrowed</h2>
                <span className="flex font-mono">
                  $
                  <AnimatedNumbers
                    includeComma
                    transitions={(index) => ({
                      type: "spring",
                      duration: 0.2 + index * 0.1,
                    })}
                    animateToNumber={totalBorrowed}
                  />
                </span>
              </div>
            </div>
          </div>
          <Divider className="!my-0" />
          <div className="flex items-center justify-between w-full px-6 pt-4 text-base">
            <h2 className="text-muted-foreground">Total Available Liquidity</h2>
            <span className="flex font-mono">
              $
              <AnimatedNumbers
                includeComma
                transitions={(index) => ({
                  type: "spring",
                  duration: 0.2 + index * 0.1,
                })}
                animateToNumber={liquidity}
              />
            </span>
          </div>
        </CardFooter>
      </Card>
    </ScrollArea>
  );
}
