import { CupSoda } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-xl font-bold text-primary">
      <CupSoda className="h-6 w-6" />
      <span>Petrichor</span>
    </div>
  );
}
