import sql from "@/app/api/utils/sql";

// GET messages (global or by country)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const message_type = searchParams.get('type') || 'global';
    const country = searchParams.get('country');
    
    let messages;
    
    if (message_type === 'local' && country) {
      messages = await sql`
        SELECT 
          cm.*,
          p.name as participant_name,
          p.country as participant_country
        FROM chat_messages cm
        LEFT JOIN participants p ON cm.participant_id = p.id
        WHERE cm.message_type = 'local' AND cm.country = ${country}
        ORDER BY cm.created_at DESC
        LIMIT 100
      `;
    } else {
      messages = await sql`
        SELECT 
          cm.*,
          p.name as participant_name,
          p.country as participant_country
        FROM chat_messages cm
        LEFT JOIN participants p ON cm.participant_id = p.id
        WHERE cm.message_type = 'global'
        ORDER BY cm.created_at DESC
        LIMIT 100
      `;
    }
    
    return Response.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST new message
export async function POST(request) {
  try {
    const body = await request.json();
    const { participant_id, message, message_type, country } = body;
    
    // Validation
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }
    
    if (message_type === 'local' && !country) {
      return Response.json({ error: 'Country is required for local messages' }, { status: 400 });
    }
    
    // Insert message
    const [newMessage] = await sql`
      INSERT INTO chat_messages (
        participant_id, message, message_type, country
      )
      VALUES (
        ${participant_id || null}, ${message}, 
        ${message_type || 'global'}, ${country || null}
      )
      RETURNING *
    `;
    
    return Response.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return Response.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
