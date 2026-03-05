import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';

export type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';

export interface Step {
  id: string;
  name: string;
  description?: string;
  status: StepStatus;
  date?: string;
}

interface StepsProps {
  steps: Step[];
}

export function Steps({ steps }: StepsProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
            {stepIdx !== steps.length - 1 ? (
              <div
                className={cn(
                  'absolute top-4 left-4 -ml-px h-full w-0.5',
                  step.status === 'completed' ? 'bg-primary-600' : 'bg-gray-200'
                )}
                aria-hidden="true"
              />
            ) : null}
            <div className="group relative flex items-start">
              <span className="flex h-9 items-center">
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white group-hover:bg-gray-50">
                  {step.status === 'completed' && (
                    <CheckCircle className="h-full w-full text-primary-600" />
                  )}
                  {step.status === 'current' && (
                    <span className="h-full w-full rounded-full border-2 border-primary-600 bg-white flex items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                    </span>
                  )}
                  {step.status === 'upcoming' && (
                    <span className="h-full w-full rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400" />
                  )}
                  {step.status === 'error' && (
                    <AlertTriangle className="h-full w-full text-red-600" />
                  )}
                </span>
              </span>
              <span className="ml-4 flex min-w-0 flex-col">
                <span className={cn('text-sm font-medium', step.status === 'completed' ? 'text-primary-600' : 'text-gray-900')}>
                  {step.name}
                </span>
                <span className="text-sm text-gray-500">{step.description}</span>
                {step.date && <span className="text-xs text-gray-400 mt-1">{step.date}</span>}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
