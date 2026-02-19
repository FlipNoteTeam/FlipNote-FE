import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/dialog";
import { Input } from "@/shared/components/input";
import { Search } from "lucide-react";

export type SelectableMember = {
  id: number;
  name: string;
  profile?: string;
  /** 이름 아래 표시할 보조 텍스트 (현재 직책, 이메일 등) */
  subtitle?: string;
};

type Props<T extends SelectableMember> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 선택 가능한 멤버 목록 */
  members: T[];
  onSelect: (member: T) => void;
  isLoading?: boolean;
  title: string;
  description?: string;
};

export const MemberSelectDialog = <T extends SelectableMember>({
  open,
  onOpenChange,
  members,
  onSelect,
  isLoading = false,
  title,
  description,
}: Props<T>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) setSearchQuery("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="멤버 이름 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-8">
                {searchQuery
                  ? "검색 결과가 없습니다."
                  : "선택 가능한 멤버가 없습니다."}
              </p>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onSelect(member)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img
                    src={
                      member.profile ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                    }
                    alt={member.name}
                    className="size-8 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    {member.subtitle && (
                      <p className="text-xs text-gray-500">{member.subtitle}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
