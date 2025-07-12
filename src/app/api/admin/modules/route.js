import { NextResponse } from 'next/server';
import { getModules } from '../../../../../admin/api/modules/route';

export async function GET() {
  try {
    return await getModules();
  } catch (error) {
    console.error('API bridge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}