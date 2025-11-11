
import React from 'react';
import { ProjectDetails } from '../types';
import { FRAMEWORKS } from '../constants';

interface ProjectSetupStepProps {
    details: ProjectDetails;
    setDetails: React.Dispatch<React.SetStateAction<ProjectDetails>>;
    onNext: () => void;
}

const ProjectSetupStep: React.FC<ProjectSetupStepProps> = ({ details, setDetails, onNext }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Project Setup</h2>
            <p className="text-text-secondary mb-6">Let's start with the basics. Give your new backend a name and choose your tech stack.</p>
            <div className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Project Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={details.name}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={details.description}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="framework" className="block text-sm font-medium text-text-secondary">Framework</label>
                    <select
                        name="framework"
                        id="framework"
                        value={details.framework}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                        {FRAMEWORKS.map(fw => <option key={fw.id} value={fw.id}>{fw.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <button
                    onClick={onNext}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                >
                    Next: Define Data Models
                </button>
            </div>
        </div>
    );
};

export default ProjectSetupStep;
