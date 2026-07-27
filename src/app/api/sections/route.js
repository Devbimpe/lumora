import { NextResponse } from 'next/server';
import { getSectionsByModuleId } from '@/app/_db/admin-db.js';
import { defineUserRoute, badRequestError, internalServerError } from '@/app/_lib/route';

export const GET = defineUserRoute(async (request) => {
  try {
    const moduleId = request.nextUrl.searchParams.get('moduleId');

    if (!moduleId) {
      return badRequestError('moduleId query parameter is required');
    }

    const sections = await getSectionsByModuleId(moduleId);
    return NextResponse.json(sections);
  } catch (error) {
    console.error('API GET sections error:', error);
    return internalServerError('Failed to fetch sections');
  }
});