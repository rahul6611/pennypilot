import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Group } from '../../../types/group';
import { Users, Plus, ChevronRight } from 'lucide-react';

export interface GroupListProps {
  groups: Group[];
  onSelectGroup: (group: Group) => void;
  onCreateGroup: () => void;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  onSelectGroup,
  onCreateGroup
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Splitwise Groups</h2>
          <p className="text-xs text-slate-400">Track trips, roommates, office lunches & shared tabs</p>
        </div>
        <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onCreateGroup}>
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {groups.map((group) => (
          <Card
            key={group.id}
            variant="glass"
            className="p-4 cursor-pointer hover:border-brand-500/40 transition-all group overflow-hidden relative"
            onClick={() => onSelectGroup(group)}
          >
            {group.coverImage && (
              <div
                className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url(${group.coverImage})` }}
              />
            )}

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 capitalize inline-block mb-2">
                  {group.category}
                </span>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{group.description}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="relative z-10 pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{group.members.length} members</span>
              </div>
              <span className="text-[11px] text-brand-400 font-medium">Tap to view balances</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
