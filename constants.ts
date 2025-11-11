export const STEPS = [
    { number: 1, title: 'Project Setup' },
    { number: 2, title: 'Data Models' },
    { number: 3, title: 'API Endpoints' },
    { number: 4, title: 'Generate Code' },
];

export const FRONTEND_STEPS = [
    { number: 1, title: 'Project Setup' },
    { number: 2, title: 'UI Description' },
    { number: 3, title: 'Generate Code' },
];

export const ADD_BACKEND_STEPS = [
    { number: 1, title: 'Upload Project' },
    { number: 2, title: 'Configure Backend' },
    { number: 3, title: 'Generate Code' },
];

export const FRAMEWORKS = [
    { id: 'nodejs-supabase', name: 'Node.js + Supabase' },
    { id: 'nodejs-express-mongoose', name: 'Node.js + Express + Mongoose' },
    { id: 'python-flask-sqlalchemy', name: 'Python + Flask + SQLAlchemy' },
    { id: 'go-gin-gorm', name: 'Go + Gin + GORM' },
];

export const FRONTEND_FRAMEWORKS = [
    { id: 'react-vite-tailwind', name: 'React + Vite + Tailwind CSS' },
    { id: 'vue-vite-tailwind', name: 'Vue + Vite + Tailwind CSS' },
    { id: 'html-css-js', name: 'Vanilla HTML, CSS, & JS' },
];

export const FIELD_TYPES = [
    'string', 'number', 'boolean', 'date', 'objectId', 'array'
];

export const HTTP_METHODS: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = [
    'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
];