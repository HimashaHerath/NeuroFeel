// components/subjects/SubjectSelector.tsx
import { useOverview } from "@/hooks/useWesadData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, ChevronDown } from "lucide-react";

interface SubjectSelectorProps {
  onSelect: (subjectId: number) => void;
  defaultValue?: number;
}

export function SubjectSelector({ onSelect, defaultValue }: SubjectSelectorProps) {
  const { data, isLoading } = useOverview();
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>(defaultValue);
  
  // Trigger the onSelect callback when defaultValue changes
  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelectedSubject(defaultValue);
    }
  }, [defaultValue]);
  
  const handleChange = (value: string) => {
    const subjectId = parseInt(value, 10);
    setSelectedSubject(subjectId);
    onSelect(subjectId);
  };
  
  if (isLoading) {
    return (
      <div className="relative w-[180px]">
        <Skeleton className="h-10 w-full bg-[#E0E0E0]/50 rounded-md" />
      </div>
    );
  }
  
  return (
    <Select 
      value={selectedSubject?.toString() || ""}
      onValueChange={handleChange}
    >
      <SelectTrigger 
        className="w-[180px] border-[#E0E0E0] bg-white hover:bg-[#F5F5F5] focus:ring-[#4464AD]/20 transition-colors"
      >
        <div className="flex items-center">
          <UserCheck className="mr-2 h-4 w-4 text-[#4464AD]" />
          <SelectValue placeholder="Select subject" className="text-[#2D3142]" />
        </div>
        <ChevronDown className="h-4 w-4 text-[#424242] opacity-50" />
      </SelectTrigger>
      <SelectContent 
        className="bg-white border border-[#E0E0E0] shadow-md"
        position="popper"
        align="start"
        sideOffset={4}
      >
        <div className="max-h-[300px] overflow-y-auto py-1">
          {data?.subjects?.map((subject) => (
            <SelectItem 
              key={subject.subject_id} 
              value={subject.subject_id.toString()}
              className="text-[#2D3142] hover:text-[#4464AD] hover:bg-[#F5F5F5] focus:bg-[#4464AD]/10 focus:text-[#4464AD] cursor-pointer transition-colors"
            >
              <div className="flex items-center">
                <UserCheck className="mr-2 h-4 w-4 text-[#4464AD]" />
                Subject S{subject.subject_id}
              </div>
            </SelectItem>
          ))}
          
          {(!data?.subjects || data.subjects.length === 0) && (
            <div className="px-2 py-4 text-center text-[#424242] text-sm">
              No subjects available
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}