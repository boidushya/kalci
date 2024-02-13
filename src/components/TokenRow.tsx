import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { tokens } from "@/utils/ConstUtils";
import { useTokenStore } from "@/stores/TokenStore";
import { Input } from "./ui/input";
import { useDebounce } from "use-debounce";

interface ITokenRowProps {
  isBorrow?: boolean;
  dataKey: number;
}

export function TokenRow({
  isBorrow = false,
  dataKey,
}: ITokenRowProps): React.ReactNode {
  const {
    addHolding,
    modifyHolding,
    removeHolding,
    holdings: _holdings,
    getBalance,
  } = useTokenStore();
  const [holdings] = useDebounce(_holdings, 500);

  const typeBasedHoldings = React.useMemo(
    () =>
      isBorrow
        ? holdings.filter((h) => h.balance < 0)
        : holdings.filter((h) => h.balance > 0),
    [holdings, isBorrow]
  );

  const initialValue = React.useMemo(
    () => typeBasedHoldings[dataKey]?.token || "",
    [dataKey, typeBasedHoldings]
  );
  const initialAmount = React.useMemo(
    () => typeBasedHoldings[dataKey]?.balance || 0,
    [dataKey, typeBasedHoldings]
  );

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const [amount, setAmount] = React.useState(initialAmount);

  React.useEffect(() => {
    if (value && amount !== 0) {
      if (holdings.some((h) => h.token === value)) {
        modifyHolding(value, amount);
      } else {
        addHolding(value, amount);
      }
    }
    if (value && amount === 0) {
      removeHolding(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, amount]);

  return (
    <div className="flex items-center justify-center gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value ? value.toUpperCase() : "Select token..."}
            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search token..." />
            <CommandEmpty>No token found.</CommandEmpty>
            <CommandGroup>
              {tokens.map((tokens) => (
                <CommandItem
                  key={tokens.name}
                  value={tokens.name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    setAmount(getBalance(currentValue));
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tokens.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tokens.name.toUpperCase()}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="number"
        placeholder="Amount"
        onChange={(e) =>
          setAmount((isBorrow ? -1 : 1) * parseFloat(e.target.value))
        }
        value={Math.abs(amount)}
        className="w-32"
      />
    </div>
  );
}
