import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";

export default function AddButton({ label }: { label: string }) {
  return (
    <DialogTrigger asChild>
      <Button variant="default" className="h-10 px-4 text-xs">
        <Plus className="size-3" />
        {label}
      </Button>
    </DialogTrigger>
  );
}
