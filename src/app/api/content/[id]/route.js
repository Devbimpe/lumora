// This is the code for edit the content 
import { NextResponse } from 'next/server';
import { updateContent, getAllModules, COLLECTIONS } from '@db/db.js';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@db/firebase.js';

// PUT handler: Updates content for a specific ContentID
// Expects a JSON body with 'Overview' and 'Reading' fields, and a ContentID from route parameters
export async function PUT(req, context) {
  try {
    const { Overview, Reading, imageURL } = await req.json();
    const params = await context.params;
    const id = params.id;
    
    // Update content in Firestore
    await updateContent(id, { Overview, Reading, imageURL });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET handler: Retrieves all modules with their ModuleID, Heading, and Subheading
export async function GET() {
  try {
    const modules = await getAllModules();
    
    // Transform to match expected format
    const formattedModules = modules.map(module => ({
      ModuleID: module.moduleId,
      Heading: module.heading,
      Subheading: module.subheading
    }));
    
    return NextResponse.json(formattedModules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE handler: Deletes content by ContentID
export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const contentId = parseInt(params.id);

    //Find and delete the content 
    const contentRef = collection(db, COLLECTIONS.CONTENT);
    const q = query(contentRef, where('contentId', '==', contentId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Delete the document
    await deleteDoc(querySnapshot.docs[0].ref);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete content',
      details: error.message 
    }, { status: 500 });  
  }
}