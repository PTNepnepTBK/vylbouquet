import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // TODO: Get all bouquets
    return NextResponse.json({ 
      success: true,
      data: []
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // TODO: Create new bouquet
    
    return NextResponse.json({ 
      success: true,
      message: 'Bouquet created'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
