
import React from 'react';
import { ApiEndpoint, DataModel } from '../types';
import { HTTP_METHODS } from '../constants';

interface EndpointsStepProps {
    models: DataModel[];
    endpoints: ApiEndpoint[];
    setEndpoints: React.Dispatch<React.SetStateAction<ApiEndpoint[]>>;
    onBack: () => void;
    onGenerate: () => void;
}

const EndpointsStep: React.FC<EndpointsStepProps> = ({ models, endpoints, setEndpoints, onBack, onGenerate }) => {
    
    const addEndpoint = () => {
        const newEndpoint: ApiEndpoint = { id: crypto.randomUUID(), method: 'GET', path: '/api/resource', description: 'Fetches the resource.' };
        setEndpoints([...endpoints, newEndpoint]);
    };

    const removeEndpoint = (id: string) => {
        setEndpoints(endpoints.filter(e => e.id !== id));
    };

    const updateEndpoint = (id: string, newEndpoint: Partial<ApiEndpoint>) => {
        setEndpoints(endpoints.map(e => e.id === id ? { ...e, ...newEndpoint } : e));
    };
    
    const autoGenerateCrud = () => {
        const newEndpoints: ApiEndpoint[] = [];
        models.forEach(model => {
            const resource = model.name.toLowerCase();
            newEndpoints.push(
                { id: crypto.randomUUID(), method: 'GET', path: `/api/${resource}s`, description: `Get all ${model.name}s.` },
                { id: crypto.randomUUID(), method: 'POST', path: `/api/${resource}s`, description: `Create a new ${model.name}.` },
                { id: crypto.randomUUID(), method: 'GET', path: `/api/${resource}s/:id`, description: `Get a single ${model.name} by ID.` },
                { id: crypto.randomUUID(), method: 'PUT', path: `/api/${resource}s/:id`, description: `Update a ${model.name} by ID.` },
                { id: crypto.randomUUID(), method: 'DELETE', path: `/api/${resource}s/:id`, description: `Delete a ${model.name} by ID.` },
            );
        });
        setEndpoints(prev => [...prev, ...newEndpoints]);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">API Endpoints</h2>
            <p className="text-text-secondary mb-6">Define the routes your API will expose. You can add them manually or auto-generate standard CRUD endpoints from your data models.</p>
            
            <div className="mb-6 flex justify-end">
                 <button onClick={autoGenerateCrud} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary">
                    Auto-generate CRUD from Models
                </button>
            </div>

            <div className="space-y-4">
                {endpoints.map(endpoint => (
                    <div key={endpoint.id} className="p-4 border border-border rounded-lg bg-background">
                         <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                            <select
                                value={endpoint.method}
                                onChange={(e) => updateEndpoint(endpoint.id, { method: e.target.value as ApiEndpoint['method'] })}
                                className="md:col-span-2 mt-1 block w-full bg-surface border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            >
                                {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="/api/path"
                                value={endpoint.path}
                                onChange={(e) => updateEndpoint(endpoint.id, { path: e.target.value })}
                                className="md:col-span-4 mt-1 block w-full bg-surface border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Endpoint description"
                                value={endpoint.description}
                                onChange={(e) => updateEndpoint(endpoint.id, { description: e.target.value })}
                                className="md:col-span-5 mt-1 block w-full bg-surface border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <button onClick={() => removeEndpoint(endpoint.id)} className="md:col-span-1 text-red-400 hover:text-red-600 text-sm">Remove</button>
                        </div>
                    </div>
                ))}
                 <button onClick={addEndpoint} className="w-full py-2 border-2 border-dashed border-border rounded-lg text-text-secondary hover:bg-border hover:text-text-primary transition-colors">
                    + Add New Endpoint
                </button>
            </div>
            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-text-primary bg-surface hover:bg-border focus:outline-none">Back</button>
                <button onClick={onGenerate} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent">Generate Backend Code</button>
            </div>
        </div>
    );
};

export default EndpointsStep;
