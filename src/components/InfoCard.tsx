import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TokenRow } from "./TokenRow";
import { useTokenStore } from "@/stores/TokenStore";
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

const Divider = () => <div className="border-t border-border" />;

export function InfoCard() {
  const { getTotalValue, holdings } = useTokenStore();

  const liquidity = getTotalValue();

  const totalSupplied = getTotalSupplied(holdings);
  const totalBorrowed = getTotalBorrowed(holdings);

  const initialSupplyRows = holdings.filter((h) => h.balance > 0).length;
  const initialBorrowRows = holdings.filter((h) => h.balance < 0).length;

  const [supplyRows, setSupplyRows] = React.useState(
    initialSupplyRows === 0 ? 1 : initialSupplyRows
  );
  const [borrowRows, setBorrowRows] = React.useState(
    initialBorrowRows === 0 ? 1 : initialBorrowRows
  );

  console.log(holdings);

  return (
    <Card className="shadow-xl w-fit">
      <CardContent className="px-0 py-0">
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
            <div className="px-4 py-6 space-y-4">
              {Array(supplyRows)
                .fill(null)
                .map((_, i) => (
                  <TokenRow key={i} dataKey={i} />
                ))}
            </div>
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
            <div className="px-4 py-6 space-y-4">
              {Array(borrowRows)
                .fill(null)
                .map((_, i) => (
                  <TokenRow key={i} dataKey={i} isBorrow />
                ))}
            </div>
          </div>
        </div>
      </CardContent>
      <Divider />
      <CardFooter className="flex-col py-6 space-y-2">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-muted-foreground">Daily Points</h2>
          <span>{calculatePoints(holdings).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-muted-foreground">Multiplier</h2>
          <span>{aggregatedMultiplier(holdings)}</span>
        </div>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-muted-foreground">Total Supplied</h2>
          <span>{totalSupplied.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-muted-foreground">Total Borrowed</h2>
          <span>{totalBorrowed.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-muted-foreground">Total Available Liquidity</h2>
          <span>${liquidity.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
