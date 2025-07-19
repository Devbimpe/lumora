import { NextResponse } from 'next/server';
import pool from "../../../db/db.js"

export async function getUsers() {
  try {
    
    console.log('✅ Database connected');
    
    const [users] = await pool.query(`
      SELECT *
      FROM users
    `);
    
    console.log(`📊 Found ${users.length} users`);
    
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch users',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function deleteUser(userId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log(`🗑️ Starting deletion for user ID: ${userId}`);

    // 1. Delete student submissions (handles foreign key to KnowledgeChecks)
    await connection.query(
      `DELETE FROM StudentSubmissions WHERE StudentID = ?`,
      [userId]
    );
    console.log('✅ Deleted student submissions');

    // Note: The user_modules table isn't in your schema, but if it exists in your actual DB:
    // await connection.query(
    //   `DELETE FROM user_modules WHERE UserID = ?`,
    //   [userId]
    // );
    // console.log('✅ Deleted user-module associations');

    // 2. Delete the user
    const [result] = await connection.query(
      `DELETE FROM Users WHERE UserID = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    await connection.commit();
    console.log(`User ${userId} deleted successfully`);
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error(`❌ User deletion failed: ${error.message}`);
    
    // Handle specific foreign key constraint error
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      const newError = new Error(
        'Cannot delete user. Remove all related records first.'
      );
      newError.statusCode = 409;
      throw newError;
    }
    
    throw error;
  } finally {
    connection.release();
  }
}

export async function toggleUserActivation(userId, newStatus) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'UPDATE Users SET isActivated = ? WHERE UserID = ?',
      [newStatus, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}