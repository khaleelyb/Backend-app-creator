import React, { useState, useCallback } from 'react';
import { ProjectDetails, DataModel, ApiEndpoint, GeneratedFile } from './types';
import { FRAMEWORKS, STEPS } from './constants';
import StepIndicator from './components/StepIndicator';
import ProjectSetupStep from './components/ProjectSetupStep';
import DataModelsStep from './components/DataModelsStep';
import EndpointsStep from './components/EndpointsStep';
import GenerationStep from './components/GenerationStep';
import { generateBackendCode } from './services/geminiService';

const App: React.FC = () => {
    const [step, setStep] = useState(1);
    const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
        name: 'my-awesome-api',
        description: 'A brief description of my new backend API.',
        framework: FRAMEWORKS[0].id,
    });
    const [models, setModels] = useState<DataModel[]>([
        { id: crypto.randomUUID(), name: 'User', description: 'Represents a user in the system. Has fields for authentication and identification.', fields: [
            { id: crypto.randomUUID(), name: 'username', type: 'string', required: true },
            { id: crypto.randomUUID(), name: 'email', type: 'string', required: true },
            { id: crypto.randomUUID(), name: 'password', type: 'string', required: true },
        ]},
        { id: crypto.randomUUID(), name: 'Post', description: 'Represents a blog post created by a user.', fields: [
            { id: crypto.randomUUID(), name: 'title', type: 'string', required: true },
            { id: crypto.randomUUID(), name: 'content', type: 'string', required: true },
        ]},
    ]);
    const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
    const [generatedCode, setGeneratedCode] = useState<GeneratedFile[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNext = () => setStep(prev => Math.min(prev + 1, STEPS.length));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
    
    const handleGenerate = useCallback(async () => {
      handleNext();
      setIsLoading(true);
      setError(null);
      setGeneratedCode(null);
      try {
        const code = await generateBackendCode(projectDetails, models, endpoints);
        setGeneratedCode(code);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }, [projectDetails, models, endpoints]);

    const renderStep = () => {
        switch (step) {
            case 1:
                return <ProjectSetupStep details={projectDetails} setDetails={setProjectDetails} onNext={handleNext} />;
            case 2:
                return <DataModelsStep models={models} setModels={setModels} onBack={handleBack} onNext={handleNext} />;
            case 3:
                return <EndpointsStep models={models} endpoints={endpoints} setEndpoints={setEndpoints} onBack={handleBack} onGenerate={handleGenerate} />;
            case 4:
                return <GenerationStep isLoading={isLoading} error={error} generatedCode={generatedCode} onBack={handleBack} onRestart={() => setStep(1)} />;
            default:
                return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="bg-surface p-4 shadow-md sticky top-0 z-10 border-b border-border">
                <div className="container mx-auto max-w-7xl">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Backend App Creator
                    </h1>
                    <p className="text-text-secondary">Visually build your API, and let Gemini do the coding.</p>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 max-w-7xl">
                <StepIndicator currentStep={step} totalSteps={STEPS.length} />
                <div className="mt-8 bg-surface p-6 rounded-lg shadow-xl border border-border">
                    {renderStep()}
                </div>
            </main>
        </div>
    );
};

export default App;