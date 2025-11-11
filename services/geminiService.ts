import { GoogleGenAI, Type } from '@google/genai';
import { ProjectDetails, DataModel, ApiEndpoint, GeneratedFile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function formatModelsForPrompt(models: DataModel[]): string {
  return models.map(model => `
- Model Name: "${model.name}"${model.description ? `\n  Description: "${model.description}"` : ""}
  Fields:
${model.fields.map(field => `    - ${field.name}: ${field.type}${field.required ? ' (required)' : ''}`).join('\n')}
`).join('');
}

function formatEndpointsForPrompt(endpoints: ApiEndpoint[]): string {
    if (endpoints.length === 0) {
        return "No specific endpoints defined. Please generate standard CRUD endpoints based on the models provided.";
    }
    return endpoints.map(endpoint => `
- Endpoint: ${endpoint.method} ${endpoint.path}
  Description: ${endpoint.description}
`).join('');
}

export const generateBackendCode = async (
    projectDetails: ProjectDetails,
    models: DataModel[],
    endpoints: ApiEndpoint[]
): Promise<GeneratedFile[]> => {

    const prompt = `
You are an expert backend developer. Your task is to generate a complete, production-ready backend application based on the user's specifications.

**Project Specifications:**

- **Project Name:** ${projectDetails.name}
- **Description:** ${projectDetails.description}
- **Framework:** ${projectDetails.framework}

**Data Models:**
${formatModelsForPrompt(models)}

**API Endpoints:**
${formatEndpointsForPrompt(endpoints)}

**Instructions:**

1.  **Generate a complete file structure.** Create all necessary files, including package definitions (\`package.json\`, \`go.mod\`, \`requirements.txt\`), application entry points (\`index.js\`, \`main.go\`, \`app.py\`), model/schema definitions, route handlers, and controller logic.
2.  **Implement the models.** For each data model specified, create the corresponding schema or model file with the correct field types and validation (e.g., required fields).
3.  **Implement the API endpoints.** For each endpoint, create the route and the business logic in a controller/handler function. Ensure the logic corresponds to the description (e.g., creating, reading, updating, deleting data).
4.  **Adhere to best practices.** Use environment variables for configuration (like database connection strings and server port), implement proper error handling, and structure the code logically (e.g., separating concerns into models, views/routes, and controllers).
5.  **Provide a README.md.** Include instructions on how to set up, install dependencies, and run the project.
6.  **Return the output as a single JSON object.** The JSON object must conform to the provided schema. The keys should be the full file paths (e.g., "src/models/User.js"), and the values should be the complete code content for that file as a string.

Do not include any explanatory text outside of the JSON object. The entire response must be the generated JSON.
`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            filePath: { type: Type.STRING },
                            code: { type: Type.STRING }
                        },
                        required: ["filePath", "code"],
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const generatedFiles: GeneratedFile[] = JSON.parse(jsonString);

        if (!Array.isArray(generatedFiles) || generatedFiles.some(f => !f.filePath || typeof f.code !== 'string')) {
             throw new Error('API returned an invalid data structure.');
        }

        return generatedFiles;

    } catch (error) {
        console.error("Error generating backend code:", error);
        throw new Error("Failed to generate code. The model may have returned an unexpected response. Please check your inputs and try again.");
    }
};