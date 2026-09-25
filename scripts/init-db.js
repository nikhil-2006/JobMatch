const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'csp.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" INTEGER,
  "refreshTokenExpiresAt" INTEGER,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "createdAt" INTEGER,
  "updatedAt" INTEGER
);

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL UNIQUE,
  "role" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "bio" TEXT,
  "avatar" TEXT,
  "phone" TEXT,
  "skills" TEXT,
  "yearsOfExperience" INTEGER,
  "companyName" TEXT,
  "companySize" TEXT,
  "companyAddress" TEXT,
  "latitude" REAL,
  "longitude" REAL,
  "isVerified" INTEGER DEFAULT 0,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "jobs" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "latitude" REAL,
  "longitude" REAL,
  "hourlyRate" TEXT NOT NULL,
  "jobType" TEXT NOT NULL,
  "skills" TEXT,
  "requiredExperience" INTEGER,
  "status" TEXT DEFAULT 'active',
  "startDate" TEXT,
  "endDate" TEXT,
  "applicantCount" INTEGER DEFAULT 0,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "applications" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "studentId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "employerId" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending',
  "message" TEXT,
  "coverLetter" TEXT,
  "availabilityNote" TEXT,
  "appliedAt" TEXT NOT NULL,
  "responseAt" TEXT,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "availability" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "recurring" INTEGER DEFAULT 1,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "schedules" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "applicationId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "employerId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "hoursPerWeek" REAL,
  "status" TEXT DEFAULT 'scheduled',
  "notes" TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "participantOne" TEXT NOT NULL,
  "participantTwo" TEXT NOT NULL,
  "lastMessageAt" TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "isRead" INTEGER DEFAULT 0,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "fromUserId" TEXT NOT NULL,
  "toUserId" TEXT NOT NULL,
  "jobId" TEXT,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "reviewType" TEXT,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT,
  "data" TEXT,
  "isRead" INTEGER DEFAULT 0,
  "createdAt" TEXT NOT NULL
);
`)

console.log('Database initialized successfully with all tables!')
