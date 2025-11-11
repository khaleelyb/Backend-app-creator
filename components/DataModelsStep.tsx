import React from 'react';
import { DataModel, ModelField } from '../types';
import { FIELD_TYPES } from '../constants';

interface DataModelsStepProps {
    models: DataModel[];
    setModels: React.Dispatch<React.SetStateAction<DataModel[]>>;
    onBack: () => void;
    onNext: () => void;
}

const DataModelsStep: React.FC<DataModelsStepProps> = ({ models, setModels, onBack, onNext }) => {

    const addModel = () => {
        setModels([...models, { id: crypto.randomUUID(), name: `NewModel${models.length + 1}`, description: '', fields: [] }]);
    };
    
    const removeModel = (id: string) => {
        setModels(models.filter(m => m.id !== id));
    };

    const updateModel = (id: string, data: Partial<DataModel>) => {
        setModels(models.map(m => m.id === id ? { ...m, ...data } : m));
    };

    const addField = (modelId: string) => {
        const newField: ModelField = { id: crypto.randomUUID(), name: 'newField', type: 'string', required: false };
        setModels(models.map(m => m.id === modelId ? { ...m, fields: [...m.fields, newField] } : m));
    };

    const removeField = (modelId: string, fieldId: string) => {
        setModels(models.map(m => m.id === modelId ? { ...m, fields: m.fields.filter(f => f.id !== fieldId) } : m));
    };

    const updateField = (modelId: string, fieldId: string, newField: Partial<ModelField>) => {
        setModels(models.map(m => m.id === modelId
            ? { ...m, fields: m.fields.map(f => f.id === fieldId ? { ...f, ...newField } : f) }
            : m
        ));
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Data Models</h2>
            <p className="text-text-secondary mb-6">Define the database schemas for your application. These will become the core of your API's data structure.</p>
            <div className="space-y-8">
                {models.map(model => (
                    <div key={model.id} className="p-4 border border-border rounded-lg bg-background">
                        <div className="flex items-center justify-between mb-2">
                            <input
                                type="text"
                                value={model.name}
                                onChange={(e) => updateModel(model.id, { name: e.target.value })}
                                className="text-lg font-bold bg-transparent border-b-2 border-border focus:border-primary focus:outline-none"
                            />
                            <button onClick={() => removeModel(model.id)} className="text-red-400 hover:text-red-600">Remove Model</button>
                        </div>
                        <textarea
                            placeholder="Model description (e.g., 'Represents a user in the system.')"
                            value={model.description}
                            onChange={(e) => updateModel(model.id, { description: e.target.value })}
                            rows={2}
                            className="block w-full bg-surface border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-text-secondary mb-4"
                        />
                        <div className="space-y-2">
                            {model.fields.map(field => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-10 gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Field Name"
                                        value={field.name}
                                        onChange={(e) => updateField(model.id, field.id, { name: e.target.value })}
                                        className="md:col-span-4 mt-1 block w-full bg-surface border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                    <select
                                        value={field.type}
                                        onChange={(e) => updateField(model.id, field.id, { type: e.target.value })}
                                        className="md:col-span-3 mt-1 block w-full bg-surface border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    >
                                        {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <div className="md:col-span-2 flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            id={`required-${field.id}`}
                                            checked={field.required}
                                            onChange={(e) => updateField(model.id, field.id, { required: e.target.checked })}
                                            className="h-4 w-4 text-primary bg-surface border-border rounded focus:ring-primary"
                                        />
                                        <label htmlFor={`required-${field.id}`} className="ml-2 text-sm text-text-secondary">Required</label>
                                    </div>
                                    <button onClick={() => removeField(model.id, field.id)} className="md:col-span-1 text-red-400 hover:text-red-600 text-sm">Remove</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addField(model.id)} className="mt-4 text-sm font-medium text-accent hover:text-green-400">+ Add Field</button>
                    </div>
                ))}
                <button onClick={addModel} className="w-full py-2 border-2 border-dashed border-border rounded-lg text-text-secondary hover:bg-border hover:text-text-primary transition-colors">
                    + Add New Model
                </button>
            </div>
            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-text-primary bg-surface hover:bg-border focus:outline-none">Back</button>
                <button onClick={onNext} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary">Next: Define API Endpoints</button>
            </div>
        </div>
    );
};

export default DataModelsStep;