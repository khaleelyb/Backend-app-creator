import React from 'react';

interface Step {
    number: number;
    title: string;
}

interface StepIndicatorProps {
    currentStep: number;
    steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.title} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {step.number < currentStep ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-primary" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-primary rounded-full">
                                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </>
                        ) : step.number === currentStep ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-border" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-surface border-2 border-primary rounded-full">
                                    <span className="h-2.5 w-2.5 bg-primary rounded-full" aria-hidden="true" />
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-border" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-surface border-2 border-border rounded-full" />
                            </>
                        )}
                         <span className="absolute top-10 w-max text-center text-sm font-medium text-text-secondary -left-2">{step.title}</span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default StepIndicator;
