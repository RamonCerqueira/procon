import React from 'react';
import { Tab } from '@headlessui/react';
import { cn } from '../../utils/cn';

interface TabsProps {
  categories: string[];
  children: React.ReactNode[];
}

export function Tabs({ categories, children }: TabsProps) {
  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl bg-primary-100 p-1">
        {categories.map((category) => (
          <Tab
            key={category}
            className={({ selected }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-primary-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            {category}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        {children.map((child, idx) => (
          <Tab.Panel
            key={idx}
            className={cn(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2'
            )}
          >
            {child}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
