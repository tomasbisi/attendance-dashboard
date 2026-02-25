"use client";

import MultiSelect from "@/components/MultiSelect";

interface FiltersProps {
  schools: string[];
  selectedSchools: string[];
  onSchoolsChange: (value: string[]) => void;
}

export default function Filters({ schools, selectedSchools, onSchoolsChange }: FiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">School:</span>
      <MultiSelect
        options={schools}
        selected={selectedSchools}
        onChange={onSchoolsChange}
        placeholder="All Schools"
      />
    </div>
  );
}
