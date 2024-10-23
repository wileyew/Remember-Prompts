import https from 'node:https';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import validator from 'validator'; // Import validator for sanitizing inputs

// Initialize the AWS Secrets Manager client
const sm = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

const getSecretValue = async (secretName, secretKey, defaultValue = '') => {
    try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response = await sm.send(command);
        const secret = JSON.parse(response.SecretString);
        return secret[secretKey] || defaultValue;
    } catch (err) {
        console.error('Error retrieving secrets:', err);
        return defaultValue;
    }
};

const sanitizeData = (data) => {
    // Sanitization strategy based on the type of data
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string') {
            // Prevent XSS by escaping HTML entities
            data[key] = validator.escape(data[key]);
        }
    });
    return data;
};

export const handler = async (event) => {
    try {
        const apiKey = await getSecretValue('MongoDBAPIKey', 'MONGO_API_KEY', 'default-api-key');

        const options = {
            hostname: 'us-east-1.aws.data.mongodb-api.com',
            port: 443,
            path: '/app/data-todpo/endpoint/data/v1/action/insertOne',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        };

        const fullPayload = {
            dataSource: 'RememberPrompt',
            database: 'userprompts',
            collection: 'prompts',
            document: sanitizeData(event.data || {}) // Sanitizing the data here
        };
        const requestData = JSON.stringify(fullPayload);

        console.log('Request data:', requestData); // Log request data for debugging

        const response = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsedBody = JSON.parse(body);
                            resolve({
                                statusCode: res.statusCode,
                                body: JSON.stringify(parsedBody)
                            });
                        } catch (e) {
                            reject(new Error('Error parsing JSON response'));
                        }
                    } else {
                        reject(new Error(`Request failed with status code ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (e) => reject(new Error(`Problem with request: ${e.message}`)));

            req.write(requestData);
            req.end();
        });

        return response;
    } catch (error) {
        console.error('Error in Lambda handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process request', details: error.message })
        };
    }
};
