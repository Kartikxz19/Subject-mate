import { CheckToken, ErrorResponse } from '@/app/helpers';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
interface RequestBody {
    category_id: number;
    subject_id: number;
    preferences: { subject_id: number }[];
}

export async function POST(request: Request) {
    noStore();
    try {
        // Extract enrollment of the student from the request
        const { enrollment } = CheckToken(request);

        const body: RequestBody = await request.json();

        const { category_id, subject_id, preferences } = body;

        // Fetch subject IDs in the specified category
        const { rows: subjectRows } = await sql`
            SELECT id FROM subjects WHERE category_id = ${category_id};
        `;

        const subjectIdsInCategory = subjectRows.map(row => row.id);

        // Verify that the subject_id and preferences belong to the specified category
        if (!subjectIdsInCategory.includes(subject_id)) {
            throw new Error('Subject id does not belong to the specified category');
        }

        for (const preference of preferences) {
            if (!subjectIdsInCategory.includes(preference.subject_id)) {
                throw new Error('Preference subject id does not belong to the specified category');
            }
        }

        // Fetch student ID based on enrollment
        const { rows: authRows } = await sql`
            SELECT id as student_id FROM auth WHERE enrollment = ${enrollment};
        `;
        
        if (authRows.length === 0) {
            throw new Error('Student not found');
        }

        const studentId = authRows[0].student_id;

        // Check if the subject_id is not present in preferences
        const subjectIdsInPreferences = preferences.map(preference => preference.subject_id);
        if (subjectIdsInPreferences.includes(subject_id)) {
            throw new Error('Subject id cannot be in preferences');
        }

        // Insert request into the database
        const { rows } = await sql`
            INSERT INTO requests (student_id, category_id, subject_id)
            VALUES (${studentId}, ${category_id}, ${subject_id})
            RETURNING id;
        `;

        const requestId = rows[0].id;

        // Insert preferences into the database
        for (let i = 0; i < preferences.length; i++) {
            const { subject_id: preferenceSubjectId } = preferences[i];
            await sql`
                INSERT INTO preferences (request_id, preference_number, subject_id)
                VALUES (${requestId}, ${i + 1}, ${preferenceSubjectId});
            `;
        }

        return Response.json({ success: true, message: 'Request created successfully' });
    } catch (error) {
        return ErrorResponse(error, 500);
    }
}
