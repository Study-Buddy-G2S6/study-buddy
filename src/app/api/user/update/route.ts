import { NextRequest, NextResponse } from 'next/server';
import { editUser } from '@/lib/dbActions';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      email,
      password,
      userName,
      description,
      courses,
      profileImage,
    } = body;

    // Call your existing DB action
    await editUser({
      id,
      email,
      password,
      userName,
      description,
      courses,
      profileImage,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error updating user', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
