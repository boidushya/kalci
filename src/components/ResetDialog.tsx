import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function ResetDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="h-9 md:w-fit w-9 md:px-4 md:py-2 py-0 px-0"
        >
          <span className="md:inline-block hidden">Reset</span>
          <RefreshCw className="h-[1.2rem] w-[1.2rem] inline-block md:hidden" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-medium">
            Are you sure you want to reset?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All position data will be lost. You
            have to enter your positions again or parse them from your wallet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Take me back</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              window.localStorage.clear();
              window.location.reload();
            }}
          >
            Yes I{`'`}m sure
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
