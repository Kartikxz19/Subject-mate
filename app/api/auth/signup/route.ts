import { ErrorResponse, SuccessResponse } from '../../../helpers';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY || ""; // Make sure to use a secure key and keep it private
const SALT_ROUNDS = 10;

export const dynamic = 'force-dynamic'
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enrollment, password, phone, name, email, next_semester, branch } = body;

    // Check if user already exists
    const alreadyExists = await sql`SELECT * FROM auth WHERE enrollment = ${enrollment} OR email = ${email} OR phone = ${phone}`;

    if (alreadyExists.rows.length > 0) {
      return ErrorResponse('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user into the database
    await sql`
      INSERT INTO auth (enrollment, password, phone, name, email, next_semester, branch) 
      VALUES (${enrollment}, ${hashedPassword}, ${phone}, ${name}, ${email}, ${next_semester}, ${branch})
    `;

    // Generate JWT token
    const token = jwt.sign(
      { enrollment, email },
      JWT_SECRET,
      { expiresIn: '30d' } // Token validity period
    );

    // Return success response with the token
    return Response.json({ token });

  } catch (error) {
    // Return error response
    return ErrorResponse(error, 500);
  }
}
