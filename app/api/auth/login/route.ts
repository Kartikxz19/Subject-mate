import { ErrorResponse, SuccessResponse } from '../../../helpers';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY || "";// Make sure to use a secure key and keep it private

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier can be enrollment, email, or phone
    console.log("Hello1");
    // Check if user exists
    const userQuery = await sql`
      SELECT * FROM auth 
      WHERE email = ${identifier} OR phone = ${identifier}
    `;
    console.log("Hello1");
    if (userQuery.rows.length === 0) {
      return ErrorResponse('Invalid credentials', 400);
    }
    console.log("Hello2");
    const user = userQuery.rows[0];
    console.log("Hello3");
    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return ErrorResponse('Invalid credentials', 400);
    }
    console.log("Hello4");

    // Generate JWT token
    const token = jwt.sign(
      { enrollment: user.enrollment, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' } // Token validity period
    );
    console.log("Hello5");
    // Return success response with the token
    return Response.json({ token });

  } catch (error) {
    // Return error response
    return ErrorResponse(error, 500);
  }
}
