import queryString from 'query-string';
import { Between, ArrayContains, Equal, Not, Like } from 'typeorm'

function isIsoDate(str: string) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
    var d = new Date(str);
    return d.toISOString() === str;
}

const typeormQuery = (q: string) => {

    const queryObject = queryString.parse(q, {
        arrayFormat: 'bracket',
        parseBooleans: true,
        parseNumbers: true,
    });
    const queryArray = Object.entries(queryObject).map(([key, value]) => {
        // Search text
        if (key == 's') {
            return { where: { [key]: Like(value) } };
        }

        // Ranges conditional
        if (Array.isArray(value)) {
            // Date range
            if (isIsoDate(value[0] as any)) {
                return {
                    where: { [key]: Between(new Date(value[0] as string), new Date(value[1] as string)) },
                };
            }
            // Number range
            return {
                where:
                    { [key]: Between(value[0], value[1]) }
            };
        }
        // Array contains conditional
        if (key.indexOf('/') != -1) {
            return { where: { [key.replace('/', '')]: ArrayContains(value as any) } };
        }

        // Offset 
        if (key.indexOf('offset') != -1) {
            return { ['skip']: value }
        }

        // Limit
        if (key.indexOf('limit') != -1) {
            return { ['take']: value }
        }

        // Sort
        if (key.indexOf('|') != -1) {
            return { order: { [key.replace('|', '')]: value } }
        }

        // Equal conditional
        if (key.indexOf('!') != -1) {
            return { where: { [key.replace('!', '')]: Not(Equal(value)) } }
        }
        return {
            where: { [key]: Equal(value) },
        };
    });
    var query = {
        where: {},
        order: {}
    };
    queryArray.forEach((item) => {
        if (item.where) {
            return query.where = { ...query.where, ...item.where }
        }
        if (item.order) {
            return query.order = { ...query.order, ...item.order }
        }
        return query = { ...query, ...item };
    });

    return query;
};

console.log(typeormQuery("age|=DESC&offset=0&limit=20&status!=ACTIVE&status=ACTIVE&age[]=1&age[]=20&created_at[]=2011-10-05T14:48:00.000Z&created_at[]=2011-10-05T14:48:00.000Z&categories/=bussines"))

export default typeormQuery;