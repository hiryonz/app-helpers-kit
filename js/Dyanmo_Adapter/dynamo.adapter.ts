import { DynamoDB } from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const dynamoAdapter = {
    async insert(table: string, item: any, keyName: string, id: string): Promise<void> {
        console.log(table)
        console.log(keyName),
            console.log(id)
        if (await this.isExistId(table, keyName, id)) {
            throw new Error(`there is already a register with this id: ${keyName} = ${id}`);
        }
        console.log("item ", item)
        await client.put({
            TableName: table,
            Item: item
        }).promise();
    },

    async getById<T>(table: string, keyName: string, id: string): Promise<T | null> {
        const result = await client.get({
            TableName: table,
            Key: { [keyName]: id }
        }).promise();

        return result.Item as T || null;
    },

    async deleteById(table: string, keyName: string, id: string): Promise<void> {
        if (!await this.isExistId(table, keyName, id)) {
            throw new Error(`there is no id with: ${keyName} = ${id}`);
        }
        await client.delete({
            TableName: table,
            Key: { [keyName]: id }
        }).promise();
    },

    async findByField<T>(table: string, field: string, value: any): Promise<T[]> {
        const result = await client.scan({
            TableName: table,
            FilterExpression: '#f = :v',
            ExpressionAttributeNames: { '#f': field },
            ExpressionAttributeValues: { ':v': value }
        }).promise();

        return result.Items as T[] || [];
    },

    async findAll<T>(table: string): Promise<T[]> {
        const result = await client.scan({ TableName: table }).promise();
        return result.Items as T[] || [];
    },

    async updateFields(
        table: string,
        keyName: string,
        id: string,
        updates: Record<string, any>
    ): Promise<void> {
        const keys = Object.keys(updates);
        if (keys.length === 0) return;

        const ExpressionAttributeNames: Record<string, string> = {};
        const ExpressionAttributeValues: Record<string, any> = {};
        const updateExpr = keys.map((key, i) => {
            const name = `#k${i}`;
            const value = `:v${i}`;
            ExpressionAttributeNames[name] = key;
            ExpressionAttributeValues[value] = updates[key];
            return `${name} = ${value}`;
        }).join(', ');

        await client.update({
            TableName: table,
            Key: { [keyName]: id },
            UpdateExpression: `SET ${updateExpr}`,
            ExpressionAttributeNames,
            ExpressionAttributeValues
        }).promise();
    },

    async isExistId(table: string, keyName: string, id: string): Promise<boolean> {
        try {
            const existing = await client.get({
                TableName: table,
                Key: { [keyName]: id }
            }).promise();
            return !!existing.Item;
        } catch (error) {
            console.log(`THE REGISTRY BY ID: ${id} NOT FOUND`)
            return false;
        }
    }

};
