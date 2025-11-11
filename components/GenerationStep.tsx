import React, { useState } from 'react';
import JSZip from 'jszip';
import { GeneratedFile, ProjectDetails } from '../types';
import CodeBlock from './CodeBlock';
import { FRAMEWORKS } from '../constants';

interface GenerationStepProps {
    isLoading: boolean;
    error: string | null;
    generatedCode: GeneratedFile[] | null;
    onBack: () => void;
    onRestart: () => void;
    appType: 'frontend' | 'backend';
    projectDetails: ProjectDetails;
    onGenerateBackendForFrontend: (backendFrameworkId: string) => void;
    backendFrameworks: typeof FRAMEWORKS;
}

const LoadingIndicator: React.FC<{ appType: 'frontend' | 'backend' }> = ({ appType }) => {
    const messages = appType === 'frontend' 
    ? [
        "Warming up the AI component factory...",
        "Translating your description into a UI...",
        "Assembling JSX and stylesheets...",
        "Wiring up state and event handlers...",
        "Finalizing file structure..."
    ] : [
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
    }, [appType]); // Rerun effect if appType changes

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-text-primary">Generating Your {appType}...</h3>
            <p className="text-text-secondary mt-2">{message}</p>
        </div>
    );
};

const GenerationStep: React.FC<GenerationStepProps> = ({ isLoading, error, generatedCode, onBack, onRestart, appType, projectDetails, onGenerateBackendForFrontend, backendFrameworks }) => {
    const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
    const [showBackendOptions, setShowBackendOptions] = useState(false);
    const [selectedBackendFramework, setSelectedBackendFramework] = useState(backendFrameworks[0].id);

    React.useEffect(() => {
        if (generatedCode && generatedCode.length > 0) {
            setSelectedFile(generatedCode[0]);
        } else {
            setSelectedFile(null);
        }
        setShowBackendOptions(false); // Reset on new generation
    }, [generatedCode]);

    const handleDownloadZip = async () => {
        if (!generatedCode) return;

        const zip = new JSZip();
        const rootFolder = zip.folder(projectDetails.name);

        if (rootFolder) {
            generatedCode.forEach(file => {
                rootFolder.file(file.filePath, file.code);
            });
        }
        
        try {
            const blob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${projectDetails.name}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error("Failed to generate zip file:", err);
        }
    };

    if (isLoading) {
        return <LoadingIndicator appType={appType} />;
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
        const title = appType === 'frontend' ? 'Frontend Generation Complete!' : 'Backend Generation Complete!';
        const description = appType === 'frontend' 
            ? 'Your frontend application code is ready. You can browse the files, download them as a .zip, or generate a matching backend.'
            : 'Your backend application code is ready. You can browse the generated files below or download the project as a .zip file.';

        return (
             <div>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">{title}</h2>
                <p className="text-text-secondary mb-6">{description}</p>
                
                {appType === 'frontend' && (
                    <div className="bg-background p-4 rounded-lg border border-border mb-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="mb-4 sm:mb-0">
                                <h4 className="font-semibold text-text-primary">Next Step: Full-Stack</h4>
                                <p className="text-sm text-text-secondary">Generate a backend API tailored to this frontend.</p>
                            </div>
                            <button 
                                onClick={() => setShowBackendOptions(!showBackendOptions)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary"
                            >
                                {showBackendOptions ? 'Cancel' : 'Generate Matching Backend'}
                            </button>
                        </div>
                        {showBackendOptions && (
                             <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row items-center gap-4">
                                <label htmlFor="backend-framework" className="text-sm font-medium text-text-secondary">Backend Stack:</label>
                                <select
                                    name="backend-framework"
                                    id="backend-framework"
                                    value={selectedBackendFramework}
                                    onChange={(e) => setSelectedBackendFramework(e.target.value)}
                                    className="block w-full sm:w-auto bg-surface border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                >
                                    {backendFrameworks.map(fw => <option key={fw.id} value={fw.id}>{fw.name}</option>)}
                                </select>
                                <button
                                    onClick={() => onGenerateBackendForFrontend(selectedBackendFramework)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent w-full sm:w-auto"
                                >
                                    Generate Backend
                                </button>
                            </div>
                        )}
                    </div>
                )}

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
                 <div className="mt-8 flex justify-between items-center">
                    <button onClick={onBack} className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-text-primary bg-surface hover:bg-border focus:outline-none">Back</button>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDownloadZip}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download ZIP
                        </button>
                        <button onClick={onRestart} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none">Start New Project</button>
                    </div>
                </div>
            </div>
        )
    }

    return null;
};

export default GenerationStep;