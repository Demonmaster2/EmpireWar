import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
    const sql = neon(process.env.DATABASE_URL);
    const playerId = event.queryStringParameters.player_id;

    try {
        if (event.httpMethod === 'GET') {
            const quests = await sql`SELECT * FROM quests WHERE player_id = ${playerId}`;
            return { statusCode: 200, body: JSON.stringify(quests) };
        } else if (event.httpMethod === 'POST') {
            const { quest_key, progress, target, completed } = JSON.parse(event.body);
            const [newQuest] = await sql`
                INSERT INTO quests (player_id, quest_key, progress, target, completed)
                VALUES (${playerId}, ${quest_key}, ${progress}, ${target}, ${completed})
                RETURNING *
            `;
            return { statusCode: 201, body: JSON.stringify(newQuest) };
        } else if (event.httpMethod === 'PUT') {
            const { quest_key, progress, completed } = JSON.parse(event.body);
            const [updatedQuest] = await sql`
                UPDATE quests
                SET progress = ${progress}, completed = ${completed}
                WHERE player_id = ${playerId} AND quest_key = ${quest_key}
                RETURNING *
            `;
            return { statusCode: 200, body: JSON.stringify(updatedQuest) };
        }
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}