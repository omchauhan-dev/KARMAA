
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Rocket } from "lucide-react";

type UpgradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType?: 'task' | 'goal';
};

export function UpgradeDialog({ open, onOpenChange, limitType = 'task' }: UpgradeDialogProps) {
  const description = limitType === 'task' 
    ? "You've reached the maximum of 3 tasks for this goal." 
    : "You've reached the maximum of 3 goals.";
    
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Upgrade to Pro</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
            <br />
            Upgrade to the Pro plan to add unlimited {limitType}s.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <AlertDialogAction>Upgrade Now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
