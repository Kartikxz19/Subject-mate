import { CheckToken, ErrorResponse } from '@/app/helpers';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

export async function POST(request: Request) {
    noStore();
    try {
        const { enrollment } = CheckToken(request);
        const { requestId } = await request.json();
        const currentRequest = await sql`
            SELECT * FROM requests WHERE id = ${requestId}
        `;
        if (!currentRequest.rows.length) {
            throw new Error("Request not found");
        }
        const { subject_id, category_id } = currentRequest.rows[0];
        const matchedRequests = await sql`
        SELECT 
        requests.*, 
        subjects.subject_name,
        pref_current.preference_number AS preference_number_current,
        pref_other.preference_number AS preference_number_other,
        auth.enrollment,
        auth.phone,
        auth.email,
        auth.name
    FROM 
        requests 
    JOIN 
        subjects ON requests.subject_id = subjects.id
    LEFT JOIN 
        preferences AS pref_current ON pref_current.request_id = ${requestId} AND pref_current.subject_id = requests.subject_id
    LEFT JOIN 
        preferences AS pref_other ON pref_other.request_id = requests.id AND pref_other.subject_id = ${subject_id}
    JOIN 
        auth ON requests.student_id = auth.id
    WHERE 
        requests.id != ${requestId}
        AND requests.category_id = ${category_id}
        AND EXISTS (
            SELECT 1 FROM preferences
            WHERE request_id = requests.id 
            AND subject_id = ${subject_id}
        )
        AND EXISTS (
            SELECT 1 FROM preferences
            WHERE request_id = ${requestId}
            AND subject_id = requests.subject_id
        );
    
`;
        return Response.json({ matchedRequests: matchedRequests.rows });
    } catch (error) {
        return ErrorResponse(error, 500);
    }
}
