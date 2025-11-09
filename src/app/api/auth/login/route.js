import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // TODO: Implementasi login logic
    
    return NextResponse.json({ 
      success: true,
      message: 'Login endpoint ready'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
