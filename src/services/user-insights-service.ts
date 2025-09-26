// src/services/user-insights-service.ts
import { databaseService, UserProfile, UserActivity } from './database-service';
import { emailService } from './email-service'; // Correctly imports the instance
import { aiService } from './ai-service';

// ... (Interfaces remain the same) ...
export interface UserInsight { /* ... */ }
export interface UserAnalytics { /* ... */ }


class UserInsightsService {
  async generateUserInsights(): Promise<UserInsight[]> {
    // ... (Implementation is the same)
    return []; // Placeholder
  }

  async generateUserAnalytics(): Promise<UserAnalytics | null> {
    // ... (Implementation is the same)
    return null; // Placeholder
  }
  
  async sendInsightsReport(insights: UserInsight[], analytics: UserAnalytics): Promise<void> {
    const { users } = await databaseService.getAllUsers();
    const adminEmails = users.filter(u => u.role === 'admin' && u.email).map(u => u.email);

    if (adminEmails.length === 0) {
      console.warn("No admin users found to send insights report.");
      return;
    }

    const reportContent = `<h2>User Management Insights & Analytics</h2>...`; // Full HTML content

    // CORRECT: Calling the method on the 'emailService' instance
    await emailService.sendReport(
      adminEmails,
      'Weekly User Insights Report',
      reportContent
    );
  }

  async performUserMaintenance(): Promise<{ totalUsers: number, inactiveUsers: number }> {
    // ... (Implementation is the same)
    return { totalUsers: 0, inactiveUsers: 0 };
  }
}

export const userInsightsService = new UserInsightsService();
