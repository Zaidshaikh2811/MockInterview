import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const MockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text("'jsonMockResp").notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: text('createdAt').notNull(),
    mockId: varchar('mockId').notNull()

})



export const UserAnswer = pgTable('userAnswer', {
    id: serial('id').primaryKey(),
    mockIdRed: varchar('mockId').notNull(),
    rating: text('rating').notNull(),
    question: text('question').notNull(),
    correctAns: text('answer').notNull(),
    userAns: text('userAns').notNull(),
    feedback: text('feedback').notNull(),
    createdAt: text('createdAt').notNull(),
    userEmail: varchar('userEmail').notNull(),
})