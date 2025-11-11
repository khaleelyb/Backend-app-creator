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

function formatFilesForPrompt(files: GeneratedFile[]): string {
    return files.map(file => `
// FILE: ${file.filePath}
// --- START OF CODE ---
${file.code}
// --- END OF CODE ---
`).join('\n\n');
}

const generateCode = async (prompt: string): Promise<GeneratedFile[]> => {
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
        console.error("Error generating code:", error);
        throw new Error("Failed to generate code. The model may have returned an unexpected response. Please check your inputs and try again.");
    }
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

**Framework-Specific Instructions:**
- If the framework is 'nodejs-supabase':
  - Use 'supabase-js' for database interaction and 'express' for the server.
  - Initialize the Supabase client using environment variables: \`SUPABASE_URL\` and \`SUPABASE_ANON_KEY\`.
  - Do NOT generate SQL table creation files. The user is expected to create tables in the Supabase UI that match the data models.
  - Implement the endpoint logic using the Supabase client (e.g., \`supabase.from('users').select()\`).
  - The README.md file should clearly state that the user needs to set up a Supabase project, create the tables, and provide the environment variables.

**Instructions:**

1.  **Generate a complete file structure.** Create all necessary files, including package definitions (\`package.json\`, \`go.mod\`, \`requirements.txt\`), application entry points (\`index.js\`, \`main.go\`, \`app.py\`), model/schema definitions, route handlers, and controller logic.
2.  **Implement the models.** For each data model specified, create the corresponding schema or model file with the correct field types and validation (e.g., required fields). For Supabase, this means your route logic should correctly handle objects matching the model structure.
3.  **Implement the API endpoints.** For each endpoint, create the route and the business logic in a controller/handler function. Ensure the logic corresponds to the description (e.g., creating, reading, updating, deleting data).
4.  **Adhere to best practices.** Use environment variables for configuration (like database connection strings, Supabase keys, and server port), implement proper error handling, and structure the code logically (e.g., separating concerns into models, views/routes, and controllers).
5.  **Provide a README.md.** Include instructions on how to set up, install dependencies, and run the project.
6.  **Return the output as a single JSON array.** Each object in the array should represent a file and conform to the schema: \`{ "filePath": string, "code": string }\`.

Do not include any explanatory text outside of the JSON. The entire response must be the generated JSON.
`;
    return generateCode(prompt);
};

export const generateFrontendCode = async (
    projectDetails: ProjectDetails,
    uiDescription: string
): Promise<GeneratedFile[]> => {

    const prompt = `
You are an expert frontend developer. Your task is to generate a complete, production-ready frontend application based on the user's specifications.

**Project Specifications:**

- **Project Name:** ${projectDetails.name}
- **Description:** ${projectDetails.description}
- **Framework/Stack:** ${projectDetails.framework}

**UI Description from User:**
---
${uiDescription}
---

**Instructions:**

1.  **Generate a complete file structure.** Create all necessary files, including package definitions (\`package.json\`), configuration files (\`vite.config.js\`, \`tailwind.config.js\`), the main HTML file (\`index.html\`), and all component/style files (\`App.jsx\`, \`index.css\`, etc.).
2.  **Implement the user's description.** Translate the user's description into functional components and a clean UI. The application should work as described. For functionality that requires a backend (e.g., fetching data, submitting forms), assume a base API path of \`/api\` and make placeholder calls (e.g., \`fetch('/api/todos')\`).
3.  **Adhere to best practices for the chosen stack.** Write clean, readable, and maintainable code. Use modern features of the framework and language. Structure the project logically.
4.  **Styling:** If the stack includes a styling solution (e.g., Tailwind CSS), use it to create a modern and aesthetically pleasing user interface. If no styling is specified, use clean, semantic CSS. Make it look good.
5.  **Provide a README.md.** Include clear instructions on how to set up the project, install dependencies (e.g., \`npm install\`), and run the development server (e.g., \`npm run dev\`).
6.  **Return the output as a single JSON array.** Each object in the array should represent a file and conform to the schema: \`{ "filePath": string, "code": string }\`.

Do not include any explanatory text outside of the JSON. The entire response must be the generated JSON.
`;
    return generateCode(prompt);
};

export const generateBackendForFrontend = async (
    backendDetails: ProjectDetails,
    uiDescription: string,
    frontendFiles: GeneratedFile[]
): Promise<GeneratedFile[]> => {
    const prompt = `
You are an expert full-stack developer specializing in creating robust backend APIs that seamlessly integrate with frontend applications.

Your task is to analyze a provided frontend application's code and generate the complete backend API required to make it fully functional.

**Frontend Application Context:**

- **Project Name:** ${backendDetails.name.replace('-api', '')}
- **Description:** ${backendDetails.description}
- **Original UI Description:**
---
${uiDescription}
---

**Your Task:**

Based on the frontend code provided below, you must:
1.  **Infer Data Models:** Analyze the frontend components, state management, and UI to determine the necessary data structures. For example, a todo list item might imply a "Todo" model with "text" and "completed" fields.
2.  **Define API Endpoints:** Determine the API routes the frontend needs to call. This includes inferring the HTTP method (GET, POST, PUT, DELETE), the path (e.g., '/api/todos'), and the purpose of each endpoint based on frontend actions like fetching data, submitting forms, or deleting items.
3.  **Generate the Backend Code:** Write the complete, production-ready backend application using the specified framework.

**Backend Technology Specification:**

- **Project Name:** ${backendDetails.name}
- **Framework:** ${backendDetails.framework}

**Framework-Specific Instructions:**
- If the framework is 'nodejs-supabase':
  - Use 'supabase-js' for database interaction and 'express' for the server.
  - Initialize the Supabase client using environment variables: \`SUPABASE_URL\` and \`SUPABASE_ANON_KEY\`.
  - Do NOT generate SQL table creation files. The user is expected to create tables in the Supabase UI that match the inferred data models.
  - Implement the endpoint logic using the Supabase client (e.g., \`supabase.from('todos').select()\`).
  - The README.md file should clearly state that the user needs to set up a Supabase project, create the tables, and provide the environment variables.

**Frontend Application Code to Analyze:**
---
${formatFilesForPrompt(frontendFiles)}
---

**Instructions:**

1.  **Generate a complete file structure.** Create all necessary files for the **${backendDetails.framework}** application.
2.  **Implement the inferred models and endpoints.** The backend logic must directly support the functionality seen in the frontend code.
3.  **Adhere to best practices.** Use environment variables, proper error handling, and a logical code structure.
4.  **Provide a README.md** for the backend project.
5.  **Return the output as a single JSON array.** Each object in the array should represent a file and conform to the schema: \`{ "filePath": string, "code": string }\`.

Do not include any explanatory text outside of the JSON. The entire response must be the generated JSON.
`;
    return generateCode(prompt);
};