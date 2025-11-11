
export const STEPS = [
    { number: 1, title: 'Project Setup' },
    { number: 2, title: 'Data Models' },
    { number: 3, title: 'API Endpoints' },
    { number: 4, title: 'Generate Code' },
];

export const FRAMEWORKS = [
    { id: 'nodejs-express-mongoose', name: 'Node.js + Express + Mongoose' },
    { id: 'python-flask-sqlalchemy', name: 'Python + Flask + SQLAlchemy' },
    { id: 'go-gin-gorm', name: 'Go + Gin + GORM' },
];

export const FIELD_TYPES = [
    'string', 'number', 'boolean', 'date', 'objectId', 'array'
];

export const HTTP_METHODS: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = [
    'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
];
