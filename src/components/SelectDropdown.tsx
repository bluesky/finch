import * as React from "react"

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
type SelectDropdownProps = {
    listItems: string[];
    placeholder?: string;
    onValueChange?: (value: string) => void;
    initialSelectedItem?: string;
    triggerClassName?: string;
    contentClassName?: string;
}

export default function SelectDropdown({ listItems, placeholder, onValueChange, initialSelectedItem, triggerClassName, contentClassName }: SelectDropdownProps) {
  return (
    <Select defaultValue={initialSelectedItem} onValueChange={onValueChange}>
      <SelectTrigger className={ cn("border-0 text-sky-900 font-medium text-center h-fit text-md p-0 w-fit m-auto", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn("bg-white", contentClassName)}>
        <SelectGroup>
          {
            listItems.map((item) => {
                return <SelectItem key={item} value={item} className="hover:cursor-pointer text-sky-600">{item}</SelectItem>
            })
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
