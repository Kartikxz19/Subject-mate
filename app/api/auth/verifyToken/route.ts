import { CheckToken, ErrorResponse } from '@/app/helpers';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(request: Request) {
    noStore();
    try {
        const { enrollment } = CheckToken(request);
        return Response.json({enrollment});
    } catch (error) {
        return ErrorResponse(error, 500);
    }
}
