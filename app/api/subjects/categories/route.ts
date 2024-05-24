import { CheckToken, ErrorResponse } from '@/app/helpers';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
export async function GET(request: Request) {
  noStore();
  try {
    const { enrollment } = CheckToken(request);

    const authQuery = await sql`
      SELECT next_semester FROM auth WHERE enrollment = ${enrollment} LIMIT 1
    `;
    const currentSemester = authQuery.rows[0]?.next_semester;

    if (!currentSemester) {
      return ErrorResponse('Student not found or semester not provided', 404);
    }
    const categoriesQuery = await sql`
    SELECT *
    FROM categories
    WHERE semester = ${currentSemester}
    AND id NOT IN (
      SELECT category_id
      FROM requests
      WHERE student_id = (
        SELECT id FROM auth WHERE enrollment = ${enrollment}
      )
    )
  `;
    const categories = categoriesQuery.rows;

    return Response.json(categories);

  } catch (error) {
    return ErrorResponse(error, 500);
  }
}
