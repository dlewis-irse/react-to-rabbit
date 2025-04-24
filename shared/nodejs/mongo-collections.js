export default [
    //  ***************************************************************
    //  Log Collection
    //  ***************************************************************
    {
        nodeId: 'log', mongoCollection: 'log', indexes: [
            [
                { timestamp: 1 },
                {
                    name: 'log_expiration',
                    expireAfterSeconds: 2592000
                }
            ]
        ]
    }
];
