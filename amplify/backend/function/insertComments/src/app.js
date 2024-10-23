import https from 'node:https';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { KMSClient, EncryptCommand } from '@aws-sdk/client-kms';
import validator from 'validator';

const sm = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
const kmsClient = new KMSClient({ region: process.env.AWS_REGION || 'us-east-1' });

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

const sanitizeInput = (input) => {
    return validator.escape(input);
};

const encryptEmail = async (email) => {
    try {
        const params = {
            KeyId: 'alias/overflowpromptsemailencryption',
            Plaintext: Buffer.from(email),
        };
        const command = new EncryptCommand(params);
        const { CiphertextBlob } = await kmsClient.send(command);
        return CiphertextBlob.toString('base64');
    } catch (err) {
        console.error('Error encrypting email:', err);
        throw new Error('Email encryption failed');
    }
};

export const handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));

        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                },
                body: JSON.stringify({ error: 'Request body is missing or undefined' }),
            };
        }

        const requestBody = JSON.parse(event.body);
        const { id, username, comment, userEmail } = requestBody;

        const safeComment = sanitizeInput(comment);
        const safeUsername = sanitizeInput(username);

        const commentObject = {
            username: safeUsername,
            comment: safeComment,
            userEmail: await encryptEmail(sanitizeInput(userEmail)),
            timestamp: new Date().toISOString()
        };

        const apiKey = await getSecretValue('MongoDBAPIKey', 'MONGO_API_KEY', 'default-api-key');

        const options = {
            hostname: 'us-east-1.aws.data.mongodb-api.com',
            port: 443,
            path: '/app/data-todpo/endpoint/data/v1/action/updateOne',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
        };

        const fullPayload = {
            collection: 'prompts',
            database: 'userprompts',
            dataSource: 'RememberPrompt',
            filter: { _id: { $oid: id } },
            update: {
                $push: { comments: commentObject }
            }
        };

        const requestData = JSON.stringify(fullPayload);

        console.log('Request data:', requestData);

        const response = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsedBody = JSON.parse(body);
                            resolve({
                                statusCode: res.statusCode,
                                headers: {
                                    "Access-Control-Allow-Origin": "*",
                                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                                },
                                body: JSON.stringify(parsedBody),
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
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ error: 'Failed to process request', details: error.message }),
        };
    }
};