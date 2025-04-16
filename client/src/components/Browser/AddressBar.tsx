import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowRight } from "lucide-react";

export default function AddressBar({
  url,
  isLoading,
  onNavigate,
}: AddressBarProps) {
  const handleRefresh = () => {
    onNavigate(url);
  };
}
