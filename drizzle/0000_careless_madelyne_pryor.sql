CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"jobId" text NOT NULL,
	"employerId" text NOT NULL,
	"status" text DEFAULT 'pending',
	"message" text,
	"coverLetter" text,
	"availabilityNote" text,
	"appliedAt" timestamp DEFAULT now() NOT NULL,
	"responseAt" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"startTime" text NOT NULL,
	"endTime" text NOT NULL,
	"recurring" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"participantOne" text NOT NULL,
	"participantTwo" text NOT NULL,
	"lastMessageAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"latitude" real,
	"longitude" real,
	"hourlyRate" text NOT NULL,
	"jobType" text NOT NULL,
	"skills" text,
	"requiredExperience" integer,
	"status" text DEFAULT 'active',
	"startDate" text,
	"endDate" text,
	"applicantCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversationId" text NOT NULL,
	"senderId" text NOT NULL,
	"recipientId" text NOT NULL,
	"content" text NOT NULL,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"data" text,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"fromUserId" text NOT NULL,
	"toUserId" text NOT NULL,
	"jobId" text,
	"rating" integer NOT NULL,
	"comment" text,
	"reviewType" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"applicationId" text NOT NULL,
	"studentId" text NOT NULL,
	"employerId" text NOT NULL,
	"jobId" text NOT NULL,
	"startDate" text NOT NULL,
	"endDate" text NOT NULL,
	"hoursPerWeek" real,
	"status" text DEFAULT 'scheduled',
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"firstName" text,
	"lastName" text,
	"bio" text,
	"avatar" text,
	"phone" text,
	"skills" text,
	"yearsOfExperience" integer,
	"companyName" text,
	"companySize" text,
	"companyAddress" text,
	"latitude" real,
	"longitude" real,
	"isVerified" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_studentId_idx" ON "applications" USING btree ("studentId");--> statement-breakpoint
CREATE INDEX "applications_jobId_idx" ON "applications" USING btree ("jobId");--> statement-breakpoint
CREATE INDEX "applications_employerId_idx" ON "applications" USING btree ("employerId");--> statement-breakpoint
CREATE INDEX "availability_userId_idx" ON "availability" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "conversations_participants_idx" ON "conversations" USING btree ("participantOne","participantTwo");--> statement-breakpoint
CREATE INDEX "jobs_userId_idx" ON "jobs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "messages_conversationId_idx" ON "messages" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "messages_senderId_idx" ON "messages" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "notifications_userId_idx" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "notifications_isRead_idx" ON "notifications" USING btree ("isRead");--> statement-breakpoint
CREATE INDEX "reviews_fromUserId_idx" ON "reviews" USING btree ("fromUserId");--> statement-breakpoint
CREATE INDEX "reviews_toUserId_idx" ON "reviews" USING btree ("toUserId");--> statement-breakpoint
CREATE INDEX "schedules_studentId_idx" ON "schedules" USING btree ("studentId");--> statement-breakpoint
CREATE INDEX "schedules_employerId_idx" ON "schedules" USING btree ("employerId");--> statement-breakpoint
CREATE INDEX "user_profiles_userId_idx" ON "user_profiles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_profiles_role_idx" ON "user_profiles" USING btree ("role");