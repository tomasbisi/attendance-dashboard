"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersProps {
  schools: string[];
  selectedSchool: string;
  onSchoolChange: (value: string) => void;
}

export default function Filters({ schools, selectedSchool, onSchoolChange }: FiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">School:</span>
      <Select value={selectedSchool} onValueChange={onSchoolChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Schools" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Schools</SelectItem>
          {schools.map((school) => (
            <SelectItem key={school} value={school}>
              {school}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
