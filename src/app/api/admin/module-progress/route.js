import { NextResponse } from 'next/server';
import {
  getAllModuleProgressWithUsers,
  getAllModules,
} from '@/app/_db/admin-db.js';
import { defineAdminRoute, internalServerError } from '@/app/_lib/route';

export const GET = defineAdminRoute(async () => {
  try {
    const [progressData, modulesData] = await Promise.all([
      getAllModuleProgressWithUsers(),
      getAllModules(),
    ]);

    return NextResponse.json({
      progress: progressData,
      modules: modulesData,
    });
  } 
  catch (error) {
    console.error('Error fetching module progress:', error);
    return internalServerError('Failed to fetch module progress');
  }
});