import { db } from './db';
import { MockInterview, UserAnswer } from './schema';
import { eq, avg, count, and } from 'drizzle-orm';

/**
 * Get interview statistics for a specific user
 * @param {string} userEmail - The email of the user
 * @returns {Promise<Object>} - Object containing success rate, completed interviews, and average score
 */
export async function getInterviewStatistics(userEmail) {
    try {
        // Get all interviews created by the user
        const interviews = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.createdBy, userEmail));

        // Get all user answers for this user
        const userAnswers = await db
            .select()
            .from(UserAnswer)
            .where(eq(UserAnswer.userEmail, userEmail));

        // Calculate completed interviews (interviews with at least one answer)
        const completedInterviewIds = new Set();
        userAnswers.forEach(answer => {
            completedInterviewIds.add(answer.mockIdRed);
        });
        const completedInterviews = completedInterviewIds.size;

        // Calculate average score from all answers
        let totalScore = 0;
        let answerCount = 0;
        userAnswers.forEach(answer => {
            // Convert rating to number (it's stored as text in the database)
            const rating = parseInt(answer.rating, 10);
            if (!isNaN(rating)) {
                totalScore += rating;
                answerCount++;
            }
        });
        const averageScore = answerCount > 0 ? (totalScore / answerCount).toFixed(1) : 0;

        // Calculate success rate (answers with rating >= 7 considered successful)
        const successfulAnswers = userAnswers.filter(answer => {
            const rating = parseInt(answer.rating, 10);
            return !isNaN(rating) && rating >= 7;
        }).length;
        const successRate = answerCount > 0 ? Math.round((successfulAnswers / answerCount) * 100) : 0;

        return {
            successRate,
            completedInterviews,
            averageScore
        };
    } catch (error) {
        console.error('Error calculating interview statistics:', error);
        return {
            successRate: 0,
            completedInterviews: 0,
            averageScore: 0
        };
    }
}