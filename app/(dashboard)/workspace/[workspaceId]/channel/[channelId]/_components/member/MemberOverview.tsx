import { useState } from "react";
import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { MemberItem } from "./MemberItem";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_PLACEHOLDER_KEYS = [
  "member-skeleton-1",
  "member-skeleton-2",
  "member-skeleton-3",
  "member-skeleton-4",
  "member-skeleton-5",
  "member-skeleton-6",
];

export function MemberOverview() {
    const [Open, setOpen] = useState(false);

    const [search, setSearch] = useState("");

    const { data, isLoading, error } = useQuery(
        orpc.workspace?.member.list.queryOptions()
    )

    if (error) {
        return <h1>Error: {error.message}</h1>
    }

    const members = data ?? [];

    const query = search.trim().toLowerCase();

    const filteredMembers = query ? members?.filter((m) => {
        const name = m.full_name?.toLowerCase();

        const email = m.email?.toLowerCase();

        return name?.includes(query) || email?.includes(query);
    }) : members;

    const skeletonPlaceholders = SKELETON_PLACEHOLDER_KEYS.map((key) => (
        <div key={key} className="flex items-center gap-3 px-4 py-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    ));

    let memberContent: React.ReactNode;
    if (isLoading) {
        memberContent = skeletonPlaceholders;
    } else if (filteredMembers.length === 0) {
        memberContent = (
            <p className="px-4 py-6 text-sm text-muted-foreground">
                No members found
            </p>
        );
    } else {
        memberContent = filteredMembers.map((member) => (
            <MemberItem key={member.id} member={member} />
        ));
    }

    return (
        <Popover open={Open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="dark:invert-20"
                >
                    <Users />
                    <span>Members</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="p-0 w-[300px]">
                <div className="p-0">
                    {/* header */}
                    <div className="px-4 py-3 border-b">
                        <h3 className="font-semibold text-sm">Members in channel</h3>
                        <p className="text-xs text-muted-foreground">Member list</p>
                    </div>

                    {/* search */}
                    <div className="p-3 border-b">
                        <div className="relative ">
                            <Search
                                className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search members..."
                                className="pl-9 h-8"
                            />
                        </div>
                    </div>

                    {/* members */}
                    <div className="max-h-80 overflow-y-auto">
                        {memberContent}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}