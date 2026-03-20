"use client";

import { useEffect, useState } from "react";

interface TxPendingSheetProps {
    hash?: string;
    isOpen: boolean;
    onClose: () => void;
    label?: string;
    description?: string;
}

export function TxPendingSheet({ hash, isOpen, onClose, label = "Transaction Pending", description = "Waiting for confirmation..." }: TxPendingSheetProps) {
    const [startY, setStartY] = useState<number>(0);

    // Prevent body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const delta = e.changedTouches[0].clientY - startY;
        if (delta > 80) onClose(); // swipe down 80px to dismiss
    };

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Bottom Sheet */}
            <div 
                className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-2xl rounded-t-3xl border-t border-[rgba(0,0,0,0.06)] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] p-6 transition-transform animate-in slide-in-from-bottom"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 opacity-50" />
                
                <div className="flex items-center gap-4 mb-8">
                    {/* Spinner */}
                    <div className="w-8 h-8 rounded-full border-2 border-[rgba(26,86,219,0.2)] border-t-[#1A56DB] animate-spin" />
                    <div>
                        <div className="font-medium text-[#111827] text-base">{label}</div>
                        <div className="text-sm text-[#6B7280]">{description}</div>
                    </div>
                </div>

                {hash ? (
                    <a
                        href={`https://testnet.bscscan.com/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-3 rounded-full border border-[rgba(0,0,0,0.06)] text-[#1A56DB] bg-[#1A56DB]/5 text-[15px] font-medium active:bg-[#1A56DB]/10 transition-colors"
                    >
                        View on BscScan ↗
                    </a>
                ) : (
                    <button
                        onClick={onClose}
                        className="block w-full text-center py-3 rounded-full border border-[rgba(0,0,0,0.06)] text-[#6B7280] bg-gray-50 text-[15px] font-medium active:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}
