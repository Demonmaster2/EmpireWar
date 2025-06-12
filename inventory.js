import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
    const sql = neon(process.env.DATABASE_URL);
    const playerId = event.queryStringParameters.player_id;

    try {
        if (event.httpMethod === 'GET') {
            const items = await sql`SELECT * FROM inventory WHERE player_id = ${playerId}`;
            return { statusCode: 200, body: JSON.stringify(items) };
        } else if (event.httpMethod === 'POST') {
            const { item_name, effect, value, equipped } = JSON.parse(event.body);
            const [newItem] = await sql`
                INSERT INTO inventory (player_id, item_name, effect, value, equipped)
                VALUES (${playerId}, ${item_name}, ${effect}, ${value}, ${equipped})
                RETURNING *
            `;
            return { statusCode: 201, body: JSON.stringify(newItem) };
        } else if (event.httpMethod === 'PUT') {
            const { id, equipped } = JSON.parse(event.body);
            const [updatedItem] = await sql`
                UPDATE inventory
                SET equipped = ${equipped}
                WHERE id = ${id} AND player_id = ${playerId}
                RETURNING *
            `;
            return { statusCode: 200, body: JSON.stringify(updatedItem) };
        } else if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);
            await sql`DELETE FROM inventory WHERE id = ${id} AND player_id = ${playerId}`;
            return { statusCode: 204, body: '' };
        }
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}