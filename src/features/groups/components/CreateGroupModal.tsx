import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Group, GroupMember } from '../../../types/group';
import { Participant } from '../../../types/user';
import { Users, Plus, Trash2, Compass, Home, Briefcase, Heart, Smile } from 'lucide-react';

export interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGroup: (group: Group) => void;
  currentUser: Participant;
}

const CATEGORIES = [
  { id: 'trip', label: 'Trip & Travel', icon: Compass, color: '#38bdf8' },
  { id: 'home', label: 'Home & Roommates', icon: Home, color: '#10b981' },
  { id: 'office', label: 'Work & Office', icon: Briefcase, color: '#f59e0b' },
  { id: 'friends', label: 'Friends & Outings', icon: Smile, color: '#a855f7' },
  { id: 'family', label: 'Family', icon: Heart, color: '#ec4899' }
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSaveGroup,
  currentUser
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'trip' | 'home' | 'office' | 'friends' | 'family' | 'other'>('trip');
  const [description, setDescription] = useState('');
  const [memberNames, setMemberNames] = useState<string[]>(['']);

  const handleAddMemberInput = () => {
    setMemberNames((prev) => [...prev, '']);
  };

  const handleRemoveMemberInput = (index: number) => {
    setMemberNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberNameChange = (index: number, val: string) => {
    setMemberNames((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const groupMembers: GroupMember[] = [
      {
        id: currentUser.id,
        name: currentUser.name || 'You',
        role: 'owner',
        joinedAt: new Date().toISOString()
      }
    ];

    memberNames.forEach((mName, idx) => {
      const trimmed = mName.trim();
      if (trimmed && trimmed.toLowerCase() !== (currentUser.name || 'you').toLowerCase()) {
        groupMembers.push({
          id: `mem-${Date.now()}-${idx}`,
          name: trimmed,
          role: 'member',
          joinedAt: new Date().toISOString()
        });
      }
    });

    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      members: groupMembers,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveGroup(newGroup);

    // Reset form
    setName('');
    setDescription('');
    setCategory('trip');
    setMemberNames(['']);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Splitwise Group"
      subtitle="Organize trips, roommates, or office expenses for automatic debt simplification."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Group Name */}
        <Input
          label="Group Name"
          required
          placeholder="e.g. Goa Trip 2026, Flat 402 Roommates"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Group Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" style={{ color: cat.color }} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description Optional */}
        <Input
          label="Description (Optional)"
          placeholder="e.g. Shared expenses for hotel, food, and petrol"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Members Builder */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-400" /> Group Members
            </span>
            <span className="text-[11px] text-slate-400">Owner: {currentUser.name || 'You'}</span>
          </div>

          <div className="space-y-2">
            {/* Owner pill */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-brand-500/30 text-xs font-semibold text-brand-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{currentUser.name || 'You'} (Group Admin)</span>
            </div>

            {/* Additional Members Inputs */}
            {memberNames.map((mName, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Member ${index + 2} Name (e.g. Rahul, Priya)`}
                  value={mName}
                  onChange={(e) => handleMemberNameChange(index, e.target.value)}
                  className="py-2 text-xs min-h-[40px]"
                />
                {memberNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMemberInput(index)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMemberInput}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="w-full text-xs border-slate-800 hover:border-slate-700 mt-1"
          >
            Add Another Member
          </Button>
        </div>

        {/* Submit */}
        <div className="pt-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="gradient" className="flex-1 font-semibold">
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};
