CREATE TABLE IF NOT EXISTS "mockInterview" (
	"id" serial PRIMARY KEY NOT NULL,
	"'jsonMockResp" text NOT NULL,
	"jobPosition" varchar NOT NULL,
	"jobDesc" varchar NOT NULL,
	"jobExperience" varchar NOT NULL,
	"createdBy" varchar NOT NULL,
	"createdAt" text NOT NULL,
	"mockId" varchar NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userAnswer" (
	"id" serial PRIMARY KEY NOT NULL,
	"mockId" varchar NOT NULL,
	"rating" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"userAns" text NOT NULL,
	"feedback" text NOT NULL,
	"createdAt" text NOT NULL,
	"userEmail" varchar NOT NULL
);
