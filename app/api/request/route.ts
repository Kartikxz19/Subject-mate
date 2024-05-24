import { CheckToken, ErrorResponse } from '@/app/helpers';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';


export async function GET(request: Request) {
    noStore();
    try {
        // Extract enrollment of the student from the request
        const { enrollment } = CheckToken(request);

        // Fetch student ID based on enrollment
        const { rows: authRows } = await sql`
            SELECT id as student_id FROM auth WHERE enrollment = ${enrollment};
        `;
        
        if (authRows.length === 0) {
            throw new Error('Student not found');
        }

        const studentId = authRows[0].student_id;

        // Fetch requests for the student from the database
        const { rows: requestRows } = await sql`
            SELECT 
            requests.*, 
            categories.category_name, 
            subjects.subject_name 
            FROM 
                requests 
            JOIN 
                categories ON requests.category_id = categories.id
            JOIN 
                subjects ON requests.subject_id = subjects.id
            WHERE 
                requests.student_id = ${studentId};
        `;

        const requestsWithPreferences = await Promise.all(requestRows.map(async (row: any) => {
            const { id: requestId } = row;
            const { rows: preferenceRows } = await sql`
                SELECT 
                    preference_number, 
                    subjects.subject_name ,
                    preferences.subject_id
                FROM 
                    preferences 
                JOIN 
                    subjects ON preferences.subject_id = subjects.id
                WHERE 
                    request_id = ${requestId}
                    ORDER BY 
                    preference_number;
            `;
            return {
                ...row,
                preferences: preferenceRows
            };
        }));

        return Response.json({ requests: requestsWithPreferences });
    } catch (error) {
        return ErrorResponse(error, 500);
    }
}
