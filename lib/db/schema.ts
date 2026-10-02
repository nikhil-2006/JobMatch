import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'

// Auth & User Profile Table
export const userProfiles = pgTable(
  'user_profiles',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    email: text('email').unique(),
    password: text('password'),
    role: text('role').notNull(),
    firstName: text('firstName'),
    lastName: text('lastName'),
    bio: text('bio'),
    avatar: text('avatar'),
    phone: text('phone'),
    skills: text('skills'),           // JSON string array
    yearsOfExperience: integer('yearsOfExperience'),
    companyName: text('companyName'),
    companySize: text('companySize'),
    companyAddress: text('companyAddress'),
    latitude: real('latitude'),
    longitude: real('longitude'),
    isVerified: boolean('isVerified').default(false),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('user_profiles_userId_idx').on(table.userId),
    roleIdx: index('user_profiles_role_idx').on(table.role),
    emailIdx: index('user_profiles_email_idx').on(table.email),
  })
)

export const jobs = pgTable(
  'jobs',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    location: text('location').notNull(),
    latitude: real('latitude'),
    longitude: real('longitude'),
    hourlyRate: text('hourlyRate').notNull(),
    jobType: text('jobType').notNull(),
    skills: text('skills'),           // JSON string array
    requiredExperience: integer('requiredExperience'),
    status: text('status').default('active'),
    startDate: text('startDate'),
    endDate: text('endDate'),
    applicantCount: integer('applicantCount').default(0),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('jobs_userId_idx').on(table.userId),
    statusIdx: index('jobs_status_idx').on(table.status),
  })
)

export const applications = pgTable(
  'applications',
  {
    id: text('id').primaryKey(),
    studentId: text('studentId').notNull(),
    jobId: text('jobId').notNull(),
    employerId: text('employerId').notNull(),
    status: text('status').default('pending'),
    message: text('message'),
    coverLetter: text('coverLetter'),
    availabilityNote: text('availabilityNote'),
    appliedAt: timestamp('appliedAt', { mode: 'string' }).notNull().defaultNow(),
    responseAt: text('responseAt'),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    studentIdIdx: index('applications_studentId_idx').on(table.studentId),
    jobIdIdx: index('applications_jobId_idx').on(table.jobId),
    employerIdIdx: index('applications_employerId_idx').on(table.employerId),
  })
)

export const availability = pgTable(
  'availability',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    dayOfWeek: integer('dayOfWeek').notNull(),
    startTime: text('startTime').notNull(),
    endTime: text('endTime').notNull(),
    recurring: boolean('recurring').default(true),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('availability_userId_idx').on(table.userId),
  })
)

export const schedules = pgTable(
  'schedules',
  {
    id: text('id').primaryKey(),
    applicationId: text('applicationId').notNull(),
    studentId: text('studentId').notNull(),
    employerId: text('employerId').notNull(),
    jobId: text('jobId').notNull(),
    startDate: text('startDate').notNull(),
    endDate: text('endDate').notNull(),
    hoursPerWeek: real('hoursPerWeek'),
    status: text('status').default('scheduled'),
    notes: text('notes'),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    studentIdIdx: index('schedules_studentId_idx').on(table.studentId),
    employerIdIdx: index('schedules_employerId_idx').on(table.employerId),
  })
)

export const conversations = pgTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    participantOne: text('participantOne').notNull(),
    participantTwo: text('participantTwo').notNull(),
    lastMessageAt: timestamp('lastMessageAt', { mode: 'string' }),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    participantsIdx: index('conversations_participants_idx').on(
      table.participantOne,
      table.participantTwo
    ),
  })
)

export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversationId').notNull(),
    senderId: text('senderId').notNull(),
    recipientId: text('recipientId').notNull(),
    content: text('content').notNull(),
    isRead: boolean('isRead').default(false),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    conversationIdIdx: index('messages_conversationId_idx').on(table.conversationId),
    senderIdIdx: index('messages_senderId_idx').on(table.senderId),
  })
)

export const reviews = pgTable(
  'reviews',
  {
    id: text('id').primaryKey(),
    fromUserId: text('fromUserId').notNull(),
    toUserId: text('toUserId').notNull(),
    jobId: text('jobId'),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    reviewType: text('reviewType'),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    fromUserIdIdx: index('reviews_fromUserId_idx').on(table.fromUserId),
    toUserIdIdx: index('reviews_toUserId_idx').on(table.toUserId),
  })
)

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message'),
    data: text('data'),
    isRead: boolean('isRead').default(false),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('notifications_userId_idx').on(table.userId),
    isReadIdx: index('notifications_isRead_idx').on(table.isRead),
  })
)

