import { CupSoda } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export function Logo() {
  const { appName } = useAppContext();
  return (
    <div className="flex items-center gap-2 text-xl font-bold">
      <CupSoda className="h-6 w-6" />
      <span>{appName}</span>
    </div>
  );
}
