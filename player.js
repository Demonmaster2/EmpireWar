import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
    const sql = neon(process.env.DATABASE_URL);
    const playerId = event.queryStringParameters.id;

    try {
        if (event.httpMethod === 'GET') {
            const [player] = await sql`SELECT * FROM players WHERE id = ${playerId}`;
            if (!player) {
                return { statusCode: 404, body: JSON.stringify({ error: 'Player not found' }) };
            }
            return { statusCode: 200, body: JSON.stringify(player) };
        } else if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const { name, clan, level, health, max_health, blood, max_blood, exp, exp_to_next, victories, coins, stats } = body;
            const [newPlayer] = await sql`
                INSERT INTO players (name, clan, level, health, max_health, blood, max_blood, exp, exp_to_next, victories, coins, stats)
                VALUES (${name}, ${clan}, ${level}, ${health}, ${max_health}, ${blood}, ${max_blood}, ${exp}, ${exp_to_next}, ${victories}, ${coins}, ${JSON.stringify(stats)}::jsonb)
                RETURNING *
            `;
            return { statusCode: 201, body: JSON.stringify(newPlayer) };
        } else if (event.httpMethod === 'PUT') {
            const body = JSON.parse(event.body);
            const { name, clan, level, health, max_health, blood, max_blood, exp, exp_to_next, victories, coins, stats } = body;
            const [updatedPlayer] = await sql`
                UPDATE players
                SET name = ${name}, clan = ${clan}, level = ${level}, health = ${health}, max_health = ${max_health},
                    blood = ${blood}, max_blood = ${max_blood}, exp = ${exp}, exp_to_next = ${exp_to_next},
                    victories = ${victories}, coins = ${coins}, stats = ${JSON.stringify(stats)}::jsonb
                WHERE id = ${playerId}
                RETURNING *
            `;
            if (!updatedPlayer) {
                return { statusCode: 404, body: JSON.stringify({ error: 'Player not found' }) };
            }
            return { statusCode: 200, body: JSON.stringify(updatedPlayer) };
        }
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}