import { CheckToken, ErrorResponse, SuccessResponse } from '@/app/helpers';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
export async function POST(request: Request) {
  noStore();
  try {
    const { enrollment } = CheckToken(request);
    const { requestId, other_enrollment } = await request.json();

    const student1row = await sql`SELECT id FROM auth WHERE enrollment = ${enrollment}`;
    if (student1row.rows.length === 0) {
      return ErrorResponse('Student not found', 404);
    }
    const { id: stud1id } = student1row.rows[0];

    const currentStudentRequestQuery = await sql`
      SELECT category_id, subject_id FROM requests WHERE id = ${requestId} AND student_id = ${stud1id}
    `;
    const currentStudentRequest = currentStudentRequestQuery.rows[0];
    if (!currentStudentRequest) {
      return ErrorResponse('Request not found or unauthorized', 404);
    }
    const { category_id, subject_id } = currentStudentRequest;

    const student2row = await sql`SELECT id FROM auth WHERE enrollment = ${other_enrollment}`;
    if (student2row.rows.length === 0) {
      return ErrorResponse('Other student not found', 404);
    }
    const { id: stud2id } = student2row.rows[0];

    const matchedRequests = await sql`
      SELECT 
          requests.id
      FROM 
          requests 
      WHERE 
          requests.id != ${requestId}
          AND student_id = ${stud2id}
          AND category_id = ${category_id}
          AND EXISTS (
              SELECT 1 FROM preferences
              WHERE request_id = requests.id 
              AND subject_id = ${subject_id}
          )
          AND EXISTS (
              SELECT 1 FROM preferences
              WHERE request_id = ${requestId}
              AND subject_id = requests.subject_id
          )
    `;

    const otherStudentRequest = matchedRequests.rows[0];
    if (!otherStudentRequest) {
      return ErrorResponse('Other student request not found or preference mismatch', 404);
    }
    await sql`
      UPDATE requests SET processed = true, other_std_id = ${stud2id} WHERE id = ${requestId}
    `;

    // Update the other student's request
    await sql`
      UPDATE requests SET processed = true, other_std_id = ${stud1id} WHERE id = ${otherStudentRequest.id}
    `;

    return SuccessResponse();

  } catch (error) {
    return ErrorResponse('Internal Server Error', 500);
  }
}
