import sql from "@/app/api/utils/sql";

// GET single participant by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const [participant] = await sql`
      SELECT * FROM participants 
      WHERE id = ${id}
    `;
    
    if (!participant) {
      return Response.json({ error: 'Participant not found' }, { status: 404 });
    }
    
    return Response.json({ participant });
  } catch (error) {
    console.error('Error fetching participant:', error);
    return Response.json({ error: 'Failed to fetch participant' }, { status: 500 });
  }
}
