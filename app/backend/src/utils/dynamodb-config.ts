const awsEnvs = ['production', 'staging']

export const isLocal = process.env.JEST_WORKER_ID || !awsEnvs.includes(String(process.env.ENVIRONMENT));

export const dbConfig = {
    ...(isLocal && {
        endpoint: 'http://localhost:8000',
        region: 'local-env',
    }),
}

export const translateConfig = {
    marshallOptions: {
        convertEmptyValues: true,
    },
}

export const tables = [
    {
        TableName: `chatx-users`,
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }, { AttributeName: 'createdAt', KeyType: 'RANGE' }],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "status-createdAt-index",
                KeySchema: [{ AttributeName: 'status', KeyType: 'HASH' }, { AttributeName: 'createdAt', KeyType: 'RANGE' }],
                Projection: {
                    NonKeyAttributes: [
                        "id",
                        "connectionId",
                        'email',
                        'username',
                        'password',
                        'chatRoom'
                    ],
                    ProjectionType: 'ALL',
                },
                ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
            },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
    {
        TableName: `chatx-messages`,
        KeySchema: [{ AttributeName: 'chatId', KeyType: 'HASH' }, { AttributeName: 'createdAt', KeyType: 'RANGE' }],
        AttributeDefinitions: [
            { AttributeName: 'chatId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
    {
        TableName: 'chatx-rooms',
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }, { AttributeName: 'createdAt', KeyType: 'RANGE' }],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
        ]
    }
]