
'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type QRCodeShareProps = {
  goalId: string;
  title: string;
};

export function QRCodeShare({ goalId, title }: QRCodeShareProps) {
  // In a real desktop app, this URL might be a deep link scheme like karma://goal/123
  // Or a web URL if there is a web version.
  // For now, we'll use a mock web URL structure or deep link.
  const shareUrl = `karma://goal/${goalId}`; 

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 flex flex-col items-center">
        <div className="mb-2 text-sm font-medium">Scan to open on mobile</div>
        <div className="bg-white p-2 rounded-md">
            <QRCodeSVG value={shareUrl} size={150} />
        </div>
        <div className="mt-2 text-xs text-muted-foreground break-all text-center max-w-[200px]">
            {shareUrl}
        </div>
      </PopoverContent>
    </Popover>
  );
}
