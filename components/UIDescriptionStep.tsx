import React from 'react';

interface UIDescriptionStepProps {
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    onBack: () => void;
    onGenerate: () => void;
}

const UIDescriptionStep: React.FC<UIDescriptionStepProps> = ({ description, setDescription, onBack, onGenerate }) => {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Describe Your UI</h2>
            <p className="text-text-secondary mb-6">Tell Gemini what you want to build. Be as descriptive as possible! Mention pages, components, functionality, and styling ideas.</p>
            <div className="space-y-6">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">Application Description</label>
                    <textarea
                        name="description"
                        id="description"
                        rows={15}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-mono"
                        placeholder="e.g., A weather app that shows the current temperature for a city. It should have a search bar to find a city and display the temperature, humidity, and wind speed in nice-looking cards..."
                    />
                </div>
            </div>
            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-text-primary bg-surface hover:bg-border focus:outline-none">Back</button>
                <button onClick={onGenerate} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent">
                    Generate Frontend Code
                </button>
            </div>
        </div>
    );
};

export default UIDescriptionStep;
