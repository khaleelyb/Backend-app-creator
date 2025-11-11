export interface ProjectDetails {
    name: string;
    description: string;
    framework: string;
}

export interface ModelField {
    id: string;
    name: string;
    type: string;
    required: boolean;
}

export interface DataModel {
    id: string;
    name: string;
    description: string;
    fields: ModelField[];
}

export interface ApiEndpoint {
    id: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
}

export interface GeneratedFile {
    filePath: string;
    code: string;
}