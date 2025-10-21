const mysql = require('mysql2/promise');
const db = require('./firebaseInit');

async function migrate() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123', // Actual MySQL password
    database: 'LUMORA' // Actual database name
  });

  try {
    const [dbName] = await conn.execute('SELECT DATABASE()');
    console.log(`Connected to MySQL database: ${dbName[0]['DATABASE()']}`);
    console.log('==========================================\n');

    // ==================== MIGRATE USERS ====================
    console.log('Starting Users migration...');
    const [users] = await conn.execute('SELECT * FROM Users');
    console.log(`Found ${users.length} users.`);
    
    for (const user of users) {
      const userRef = db.collection('users').doc(String(user.UserID));
      await userRef.set({
        userId: user.UserID,
        username: user.Username,
        email: user.Email,
        role: user.Role.toLowerCase(),
        percentModulesCompleted: parseFloat(user.PercentModulesCompleted) || 0,
        isActivated: !!user.isActivated,
        activationToken: user.ActivationToken || null,
        activationTokenExpires: user.activationTokenExpires || null,
        createdAt: new Date()
      });
      console.log(`User migrated: ${user.Username} (ID: ${user.UserID})`);
    }
    console.log(`Users migration complete: ${users.length} users migrated\n`);

    // ==================== MIGRATE MODULES ====================
    console.log('📚 Starting Modules migration...');
    const [modules] = await conn.execute('SELECT * FROM Modules');
    console.log(`Found ${modules.length} modules.`);
    
    for (const mod of modules) {
      const moduleRef = db.collection('modules').doc(String(mod.ModuleID));
      await moduleRef.set({
        moduleId: mod.ModuleID,
        heading: mod.Heading,
        subheading: mod.Subheading,
        createdAt: new Date()
      });
      console.log(`  Module migrated: ${mod.Heading} (ID: ${mod.ModuleID})`);
    }
    console.log(`Modules migration complete: ${modules.length} modules migrated\n`);

    // ==================== MIGRATE CONTENT ====================
    console.log('Starting Content migration...');
    const [contents] = await conn.execute('SELECT * FROM Content ORDER BY ContentID ASC');
    console.log(`Found ${contents.length} content items.`);
    
    for (const content of contents) {
      const contentRef = db.collection('content').doc(String(content.ContentID));
      await contentRef.set({
        contentId: content.ContentID,
        moduleId: content.ModuleID,
        overview: content.Overview || '',
        reading: content.Reading || '',
        createdAt: new Date()
      });
      console.log(`  Content migrated: ID ${content.ContentID} (Module ${content.ModuleID})`);
    }
    console.log(`Content migration complete: ${contents.length} content items migrated\n`);

    // ==================== MIGRATE KNOWLEDGE CHECKS ====================
    console.log('Starting Knowledge Checks migration...');
    const [knowledgeChecks] = await conn.execute('SELECT * FROM KnowledgeChecks');
    console.log(`Found ${knowledgeChecks.length} knowledge checks.`);
    
    for (const check of knowledgeChecks) {
      const checkRef = db.collection('knowledgeChecks').doc(String(check.KnowledgeCheckID));
      await checkRef.set({
        knowledgeCheckId: check.KnowledgeCheckID,
        contentId: check.ContentID,
        question: check.Question,
        answer: check.Answer,
        createdAt: new Date()
      });
      console.log(`  Knowledge Check migrated: ID ${check.KnowledgeCheckID} (Content ${check.ContentID})`);
    }
    console.log(`Knowledge Checks migration complete: ${knowledgeChecks.length} checks migrated\n`);

    // ==================== MIGRATE STUDENT SUBMISSIONS ====================
    console.log('Starting Student Submissions migration...');
    const [submissions] = await conn.execute('SELECT * FROM StudentSubmissions');
    console.log(`Found ${submissions.length} student submissions.`);
    
    for (const sub of submissions) {
      const subRef = db.collection('studentSubmissions').doc(String(sub.StudentSubmissionID));
      await subRef.set({
        submissionId: sub.StudentSubmissionID,
        knowledgeCheckId: sub.KnowledgeCheckID,
        studentId: sub.StudentID,
        submissionAnswer: sub.SubmissionAnswer,
        grade: sub.Grade ? parseFloat(sub.Grade) : null,
        createdAt: new Date()
      });
      console.log(`  Submission migrated: ID ${sub.StudentSubmissionID} (Student ${sub.StudentID})`);
    }
    console.log(`Student Submissions migration complete: ${submissions.length} submissions migrated\n`);

    await conn.end();
    
    console.log('MIGRATION COMPLETE!');

  } catch (error) {
    console.error('Migration failed:', error);
    await conn.end();
    process.exit(1);
  }
}

migrate();