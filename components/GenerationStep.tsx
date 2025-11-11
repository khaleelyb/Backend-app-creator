
import React, { useState } from 'react';
import { GeneratedFile } from '../types';
import CodeBlock from './CodeBlock';

interface GenerationStepProps {
    isLoading: boolean;
    error: string | null;
    generatedCode: GeneratedFile[] | null;
    onBack: () => void;
    onRestart: () => void;
}

const LoadingIndicator: React.FC = () => {
    const messages = [
        "Warming up the AI code forge...",
        "Translating your vision into logic...",
        "Assembling boilerplate and structure...",
        "Generating data models and schemas...",
        "Building API routes and controllers...",
        "Finalizing file structure..."
    ];
    const [message, setMessage] = useState(messages[0]);
    
    React.useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-text-primary">Generating Your Backend...</h3>
            <p className="text-text-secondary mt-2">{message}</p>
        </div>
    );
};

const GenerationStep: React.FC<GenerationStepProps> = ({ isLoading, error, generatedCode, onBack, onRestart }) => {
    const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(generatedCode ? generatedCode[0] : null);

    React.useEffect(() => {
        if (generatedCode && generatedCode.length > 0 && !selectedFile) {
            setSelectedFile(generatedCode[0]);
        }
    }, [generatedCode, selectedFile]);

    if (isLoading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <h3 className="text-xl font-semibold text-red-400">An Error Occurred</h3>
                <p className="text-text-secondary mt-2 bg-background p-4 rounded-md">{error}</p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={onBack} className="px-4 py-2 border border-border rounded-md">Back</button>
                    <button onClick={onRestart} className="px-4 py-2 bg-primary text-white rounded-md">Start Over</button>
                </div>
            </div>
        );
    }
    
    if (generatedCode) {
        return (
             <div>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">Code Generation Complete!</h2>
                <p className="text-text-secondary mb-6">Your backend application code is ready. You can browse the generated files below and copy the code for each one.</p>
                <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
                    <div className="md:w-1/4">
                        <h3 className="text-lg font-semibold mb-2">File Structure</h3>
                        <ul className="space-y-1">
                            {generatedCode.map(file => (
                                <li key={file.filePath}>
                                    <button 
                                        onClick={() => setSelectedFile(file)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedFile?.filePath === file.filePath ? 'bg-primary text-white' : 'hover:bg-border'}`}
                                    >
                                        {file.filePath}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-3/4">
                        {selectedFile && <CodeBlock key={selectedFile.filePath} code={selectedFile.code} filename={selectedFile.filePath} />}
                    </div>
                </div>
                 <div className="mt-8 flex justify-between">
                    <button onClick={onBack} className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-text-primary bg-surface hover:bg-border focus:outline-none">Back</button>
                    <button onClick={onRestart} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none">Start New Project</button>
                </div>
            </div>
        )
    }

    return null;
};

export default GenerationStep;
