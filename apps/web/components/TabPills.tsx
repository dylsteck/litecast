'use client';

import clsx from 'clsx';

interface Tab {
  id: string;
  label: string;
}

interface TabPillsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function TabPills({ tabs, activeTab, onChange }: TabPillsProps) {
  return (
    <div className="flex items-center gap-5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'text-[15px] font-semibold transition-colors',
            activeTab === tab.id
              ? 'text-system-label'
              : 'text-system-tertiary-label hover:text-system-secondary-label'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
