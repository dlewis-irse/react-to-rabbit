export function validateConfig (credentials) {
    const requiredEnvVars = [
        'RABBITMQ_URL',
        'VITE_APPLICATION_NAME',
        'VITE_SERVER_PORT'
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    const requiredCredentials = [
        'MONGO_CONNECTION_STRING'
    ];

    const missingCredentials = requiredCredentials.filter((varName) => !credentials[varName]);

    if (credentials.length > 0) {
        throw new Error(`Missing required Credentials: ${missingCredentials.join(', ')}`);
    }
}
