import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../../utils/cn';

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {children}
    </Menu>
  );
}

export function DropdownMenuTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Menu.Button className={cn('inline-flex w-full justify-center rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2', className)}>
      {children}
    </Menu.Button>
  );
}

export function DropdownMenuContent({ children, className, align = 'right' }: { children: React.ReactNode; className?: string; align?: 'left' | 'right' }) {
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className={cn(
          'absolute z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          align === 'right' ? 'right-0' : 'left-0',
          className
        )}
      >
        <div className="px-1 py-1">{children}</div>
      </Menu.Items>
    </Transition>
  );
}

export function DropdownMenuItem({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            'group flex w-full items-center rounded-md px-2 py-2 text-sm',
            active ? 'bg-primary-500 text-white' : 'text-gray-900',
            className
          )}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{children}</div>;
}
