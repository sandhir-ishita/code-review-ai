require("dotenv").config();
const fs = require("fs");
const path = require("path");
const prisma = require("../src/config/database");

async function runBackup() {
  const backupDir = path.join(__dirname, "..", "backups");
  fs.mkdirSync(backupDir, { recursive: true });

  const [users, projects, submissions, staticAnalyses, reviews, issues] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, isEmailVerified: true, createdAt: true } }),
    prisma.project.findMany(),
    prisma.codeSubmission.findMany(),
    prisma.staticAnalysis.findMany(),
    prisma.review.findMany(),
    prisma.issue.findMany(),
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(backupDir, `backup-${timestamp}.json`);

  fs.writeFileSync(
    filePath,
    JSON.stringify({ exportedAt: new Date().toISOString(), counts: { users: users.length, projects: projects.length, submissions: submissions.length, reviews: reviews.length }, data: { users, projects, submissions, staticAnalyses, reviews, issues } }, null, 2)
  );

  console.log(`Backup saved: ${filePath}`);
  await prisma.$disconnect();
}

runBackup().catch((err) => { console.error("Backup failed:", err); process.exit(1); });
