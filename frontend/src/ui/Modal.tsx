import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, footer, className }: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("max-w-[520px] p-0 overflow-hidden border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl", className)}>
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <DialogTitle className="text-[15px] font-medium text-foreground uppercase tracking-tight m-0">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-[13.5px] font-medium text-foreground/90">
          {children}
        </div>
        
        {footer && (
          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
