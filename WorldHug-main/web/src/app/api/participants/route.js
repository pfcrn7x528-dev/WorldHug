import sql from "@/app/api/utils/sql";

// GET all participants (ordered by chain position)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    
    let participants;
    
    if (country) {
      participants = await sql`
        SELECT * FROM participants 
        WHERE country = ${country}
        ORDER BY chain_position ASC, created_at ASC
      `;
    } else {
      participants = await sql`
        SELECT * FROM participants 
        ORDER BY chain_position ASC, created_at ASC
      `;
    }
    
    return Response.json({ participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return Response.json({ error: 'Failed to fetch participants' }, { status: 500 });
  }
}

// POST - Create new participant
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, location, latitude, longitude, photo_url, message_of_peace, country } = body;
    
    // Validation
    if (!name || !location) {
      return Response.json({ error: 'Name and location are required' }, { status: 400 });
    }
    
    // Get the next chain position
    const [result] = await sql`
      SELECT COALESCE(MAX(chain_position), 0) + 1 as next_position 
      FROM participants
    `;
    const chain_position = result.next_position;
    
    // Insert new participant
    const [participant] = await sql`
      INSERT INTO participants (
        name, location, latitude, longitude, photo_url, 
        message_of_peace, country, chain_position
      )
      VALUES (
        ${name}, ${location}, ${latitude || null}, ${longitude || null}, 
        ${photo_url || null}, ${message_of_peace || null}, 
        ${country || null}, ${chain_position}
      )
      RETURNING *
    `;
    
    return Response.json({ participant }, { status: 201 });
  } catch (error) {
    console.error('Error creating participant:', error);
    return Response.json({ error: 'Failed to create participant' }, { status: 500 });
  }
}
