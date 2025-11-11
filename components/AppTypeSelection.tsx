import React from 'react';

interface AppTypeSelectionProps {
    onSelect: (type: 'backend' | 'frontend' | 'add-backend') => void;
}

const Card: React.FC<{ onClick: () => void; title: string; description: string; children: React.ReactNode, className?: string }> = ({ onClick, title, description, children, className }) => (
    <button
        onClick={onClick}
        className={`group bg-surface p-8 rounded-lg shadow-xl border border-border hover:border-primary transition-all duration-300 transform hover:-translate-y-1 text-left ${className}`}
    >
        {children}
        <h2 className="text-2xl font-bold text-text-primary mt-4 group-hover:text-white">{title}</h2>
        <p className="text-text-secondary mt-2">{description}</p>
    </button>
);


const AppTypeSelection: React.FC<AppTypeSelectionProps> = ({ onSelect }) => {
    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Gemini App Creator
                </h1>
                <p className="text-text-secondary mt-4 text-lg">What are you building today?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
                <Card
                    onClick={() => onSelect('backend')}
                    title="Backend Creator"
                    description="Visually design your data models and API endpoints. Generate production-ready backend code in Node.js, Python, or Go."
                    className="hover:border-primary"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3V7.5a3 3 0 013-3h13.5a3 3 0 013 3v3.75a3 3 0 01-3 3m-13.5 0v-3.75a3 3 0 013-3h13.5a3 3 0 013 3v3.75m-16.5 0a3 3 0 003 3h10.5a3 3 0 003-3m-13.5 0v-3.75" />
                    </svg>
                </Card>
                 <Card
                    onClick={() => onSelect('frontend')}
                    title="Frontend Creator"
                    description="Describe the UI you want to build. Generate a complete frontend application using React, Vue, or vanilla JS."
                    className="hover:border-accent"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </Card>
                <Card
                    onClick={() => onSelect('add-backend')}
                    title="Add Backend to Project"
                    description="Upload an existing frontend project and generate a tailor-made backend API to power it."
                    className="hover:border-secondary md:col-span-2 lg:col-span-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </Card>
            </div>
        </div>
    );
};

export default AppTypeSelection;