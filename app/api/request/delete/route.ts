import { CheckToken, ErrorResponse, SuccessResponse } from '@/app/helpers';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
export async function DELETE(request: Request) {
  noStore();
  try {
    const { enrollment } = CheckToken(request);
    const { requestId } = await request.json();

    const requestQuery = await sql`
      SELECT student_id FROM requests WHERE id = ${requestId}
    `;
    const requestDetails = requestQuery.rows[0];

    if (!requestDetails) {
      return ErrorResponse('Request not found', 404);
    }

    const studentQuery = await sql`
      SELECT id FROM auth WHERE enrollment = ${enrollment}
    `;
    const studentDetails = studentQuery.rows[0];

    if (!studentDetails || studentDetails.id !== requestDetails.student_id) {
      return ErrorResponse('Unauthorized', 403);
    }
    await sql`
      DELETE FROM requests WHERE id = ${requestId}
    `;
    return SuccessResponse();

  } catch (error) {
    return ErrorResponse(error, 500);
  }
}
