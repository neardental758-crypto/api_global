const MOTORDB = process.env.MOTORDB;

const getProperties = () => {
    const data = {
        nosql:{
            id:'_id'
        },
        mysql:{
            iat: 'iat',
            exp: 'exp'
        }
    };
    return data[MOTORDB];
}

module.exports = getProperties;