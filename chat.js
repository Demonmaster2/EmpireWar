import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
    const sql = neon(process.env.DATABASE_URL);

    try {
        if (event.httpMethod === 'GET') {
            const messages = await sql`
                SELECT cm.*, p.name AS player_name 
                FROM chat_messages cm 
                LEFT JOIN players p ON cm.player_id = p.id 
                ORDER BY created_at DESC LIMIT 50
            `;
            return { statusCode: 200, body: JSON.stringify(messages) };
        } else if (event.httpMethod === 'POST') {
            const { player_id, message, type } = JSON.parse(event.body);
            const sanitizedMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const [newMessage] = await sql`
                INSERT INTO chat_messages (player_id, message, type)
                VALUES (${player_id}, ${sanitizedMessage}, ${type})
                RETURNING *
            `;
            return { statusCode: 201, body: JSON.stringify(newMessage) };
        }
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}