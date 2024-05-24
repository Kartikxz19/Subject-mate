import { sql } from '@vercel/postgres';
import jwt from "jsonwebtoken";
import { JwtPayload } from 'jsonwebtoken';

export const ErrorResponse = (error: any, statusCode: number) => {
  return new Response(JSON.stringify({ error: error.toString() }), { status: statusCode })
}

export const SuccessResponse = () => {
  return new Response(JSON.stringify({ success: true }), { status: 201 })
}


interface TokenPayload extends JwtPayload {
  enrollment: string;
  email: string;
}

export const CheckToken = (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Not authenticated!');
  }
  const token = authHeader.split(' ')[1];
  let decodedToken: string | JwtPayload;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || '');
  } catch (error) {
    throw error;
  }
  if (!decodedToken || typeof decodedToken === 'string') {
    throw new Error('Not authenticated!');
  }
  const { enrollment, email } = decodedToken as TokenPayload;
  if (!enrollment || !email) {
    throw new Error('Token payload is missing required properties!');
  }
  return { enrollment, email };
};
