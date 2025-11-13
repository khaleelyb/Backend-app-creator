import React, { useState, useCallback } from 'react';
import { ProjectDetails, DataModel, ApiEndpoint, GeneratedFile } from './types';
import { FRAMEWORKS, FRONTEND_FRAMEWORKS, STEPS, FRONTEND_STEPS, ADD_BACKEND_STEPS } from './constants';
import StepIndicator from './components/StepIndicator';
import ProjectSetupStep from './components/ProjectSetupStep';
import DataModelsStep from './components/DataModelsStep';
import EndpointsStep from './components/EndpointsStep';
import GenerationStep from './components/GenerationStep';
import AppTypeSelection from './components/AppTypeSelection';
import UIDescriptionStep from './components/UIDescriptionStep';
import UploadStep from './components/UploadStep';
import { generateBackendCode, generateFrontendCode, generateBackendForFrontend } from './services/geminiService';

const App: React.FC = () => {
    const [appType, setAppType] = useState<'backend' | 'frontend' | 'add-backend' | null>(null);
    const [step, setStep] = useState(1);

    // Shared Generation State
    const [generatedCode, setGeneratedCode] = useState<GeneratedFile[] | null>(null);
    const [frontendCodeCache, setFrontendCodeCache] = useState<GeneratedFile[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Backend State
    const [backendProjectDetails, setBackendProjectDetails] = useState<ProjectDetails>({
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

    // Frontend State
    const [frontendProjectDetails, setFrontendProjectDetails] = useState<ProjectDetails>({
        name: 'my-awesome-app',
        description: 'A brief description of my new frontend app.',
        framework: FRONTEND_FRAMEWORKS[0].id,
    });
    const [uiDescription, setUiDescription] = useState<string>('A simple todo list app. It should have an input field, an "Add" button, and a list of todos. Each todo item should have a checkbox to mark it as complete and a delete button.');

    // Add Backend to Existing App State
    const [uploadedFiles, setUploadedFiles] = useState<GeneratedFile[] | null>(null);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
    
    const resetState = () => {
        setStep(1);
        setGeneratedCode(null);
        setFrontendCodeCache(null);
        setUploadedFiles(null);
        setIsLoading(false);
        setError(null);
        // We don't reset project details to keep user input if they just switch types
    };
    
    const handleRestart = () => {
        setAppType(null);
        resetState();
    }

    const handleSelectAppType = (type: 'backend' | 'frontend' | 'add-backend') => {
        setAppType(type);
        resetState();
    };

    const handleGenerateBackend = useCallback(async () => {
      handleNext();
      setIsLoading(true);
      setError(null);
      setGeneratedCode(null);
      try {
        const code = await generateBackendCode(backendProjectDetails, models, endpoints);
        setGeneratedCode(code);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }, [backendProjectDetails, models, endpoints]);

    const handleGenerateFrontend = useCallback(async () => {
        handleNext();
        setIsLoading(true);
        setError(null);
        setGeneratedCode(null);
        setFrontendCodeCache(null);
        try {
            const code = await generateFrontendCode(frontendProjectDetails, uiDescription);
            setGeneratedCode(code);
            setFrontendCodeCache(code);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
      }, [frontendProjectDetails, uiDescription]);
    
    const handleGenerateBackendForFrontend = useCallback(async (backendFramework: string) => {
        if (!frontendCodeCache) {
            setError("Frontend code is not available to generate a backend.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedCode(null);
        setAppType('backend'); // Switch the context to backend
        setStep(STEPS.length); // Jump to the final step for backend

        try {
            const backendDetails = { ...frontendProjectDetails, framework: backendFramework, name: `${frontendProjectDetails.name}-api`};
            setBackendProjectDetails(backendDetails);
            const code = await generateBackendForFrontend(backendDetails, uiDescription, frontendCodeCache);
            setGeneratedCode(code);
            setFrontendCodeCache(null); // Clear cache after use
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [frontendProjectDetails, uiDescription, frontendCodeCache]);
    
    const handleUploadComplete = useCallback((files: GeneratedFile[]) => {
        setUploadedFiles(files);
        setBackendProjectDetails(prev => ({...prev, name: 'my-uploaded-app-api'}));
        handleNext();
    }, []);

    const handleGenerateBackendForUpload = useCallback(async () => {
        if (!uploadedFiles) {
            setError("Uploaded files are not available to generate a backend.");
            return;
        }
        handleNext();
        setIsLoading(true);
        setError(null);
        setGeneratedCode(null);

        try {
            const code = await generateBackendForFrontend(backendProjectDetails, "UI description to be inferred from the provided code.", uploadedFiles);
            setGeneratedCode(code);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [backendProjectDetails, uploadedFiles]);


    const renderStep = () => {
        // For 'add-backend' flow, we use backendProjectDetails. For others, it depends on appType.
        const projectDetails = appType === 'frontend' ? frontendProjectDetails : backendProjectDetails;
        
        const finalStepProps = {
            isLoading: isLoading,
            error: error,
            generatedCode: generatedCode,
            onBack: handleBack,
            onRestart: handleRestart,
            appType: appType!,
            projectDetails: projectDetails,
            onGenerateBackendForFrontend: handleGenerateBackendForFrontend,
            backendFrameworks: FRAMEWORKS,
        };

        if (appType === 'backend') {
            switch (step) {
                case 1:
                    return <ProjectSetupStep details={backendProjectDetails} setDetails={setBackendProjectDetails} onNext={handleNext} frameworks={FRAMEWORKS} nextButtonText="Next: Define Data Models"/>;
                case 2:
                    return <DataModelsStep models={models} setModels={setModels} onBack={handleBack} onNext={handleNext} />;
                case 3:
                    return <EndpointsStep models={models} endpoints={endpoints} setEndpoints={setEndpoints} onBack={handleBack} onGenerate={handleGenerateBackend} />;
                case 4:
                    return <GenerationStep {...finalStepProps} />;
                default:
                    return <div>Unknown Step</div>;
            }
        }
        if (appType === 'frontend') {
            switch (step) {
                case 1:
                    return <ProjectSetupStep details={frontendProjectDetails} setDetails={setFrontendProjectDetails} onNext={handleNext} frameworks={FRONTEND_FRAMEWORKS} nextButtonText="Next: Describe UI" />;
                case 2:
                    return <UIDescriptionStep description={uiDescription} setDescription={setUiDescription} onBack={handleBack} onGenerate={handleGenerateFrontend} />;
                case 3:
                    return <GenerationStep {...finalStepProps} />;
                default:
                    return <div>Unknown Step</div>;
            }
        }
        if (appType === 'add-backend') {
             switch (step) {
                case 1:
                    return <UploadStep onUploadComplete={handleUploadComplete} />;
                case 2:
                    return <ProjectSetupStep 
                        details={backendProjectDetails} 
                        setDetails={setBackendProjectDetails} 
                        onNext={handleGenerateBackendForUpload} 
                        frameworks={FRAMEWORKS} 
                        nextButtonText="Generate Backend"
                        title="Configure Backend"
                        description="Your frontend project has been analyzed. Now, configure the details for the backend you want to generate."
                    />;
                case 3:
                    return <GenerationStep {...finalStepProps} />;
                default:
                    return <div>Unknown Step</div>;
            }
        }
        return null;
    };
    
    if (!appType) {
        return <AppTypeSelection onSelect={handleSelectAppType} />;
    }
    
    const currentSteps = appType === 'backend' ? STEPS 
        : appType === 'frontend' ? FRONTEND_STEPS 
        : ADD_BACKEND_STEPS;
        
    const title = appType === 'backend' ? 'Backend App Creator' 
        : appType === 'frontend' ? 'Frontend App Creator'
        : 'Add Backend to Project';
        
    const subtitle = appType === 'backend' ? 'Visually build your API, and let Gemini do the coding.' 
        : appType === 'frontend' ? 'Describe your UI, and let Gemini do the coding.'
        : 'Upload your frontend project to generate a matching backend.';

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="bg-surface p-4 shadow-md sticky top-0 z-10 border-b border-border">
                <div className="container mx-auto max-w-7xl flex justify-between items-center">
                    <div>
                         <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            {title}
                        </h1>
                        <p className="text-text-secondary">{subtitle}</p>
                    </div>
                    <button onClick={handleRestart} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                        Change App Type
                    </button>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 max-w-7xl">
                <StepIndicator currentStep={step} steps={currentSteps} />
                <div className="mt-8 bg-surface p-6 rounded-lg shadow-xl border border-border">
                    {renderStep()}
                </div>
            </main>
        </div>
    );
};

export default App;