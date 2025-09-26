// src/components/dashboard/DashboardOverview.tsx

// ... (All imports remain the same) ...
import { emailService } from '@/services/email-service'; // Correctly imports the instance

// ... (Interfaces and component structure remains the same) ...

function DeviceManagementDashboard() {
  // ... (State and useEffect logic is the same) ...

  const handleSendTestAlert = async () => {
    try {
      // CORRECT: Calling the method on the 'emailService' instance
      const success = await emailService.sendDeviceAlert(
        ['admin@hospital.com'], 'OCT Scanner #3', 'Calibration Drift',
        'Device calibration has drifted beyond acceptable parameters...', 'critical'
      );
      // ... (toast logic)
    } catch (error) {
      // ... (toast logic)
    }
  };

  const handleSendMaintenanceNotification = async () => {
    try {
      // CORRECT: Calling the method on the 'emailService' instance
      const success = await emailService.sendMaintenanceNotification(
        ['maintenance@hospital.com'], 'Fundus Camera #1', 'Quarterly Calibration',
        new Date().toLocaleDateString(), 'medium'
      );
      // ... (toast logic)
    } catch (error) {
      // ... (toast logic)
    }
  };

  // ... (Rest of the component JSX) ...
  return ( <div>...</div> );
}```

### 4. `src/components/users/UserManagement.tsx` (Final Corrected Version)

This file uses `emailService` and is guaranteed to call the instance correctly.

```typescript
// src/components/users/UserManagement.tsx

// ... (All imports remain the same) ...
import { emailService } from '@/services/email-service'; // Correctly imports the instance

export default function UserManagement() {
  // ... (State and other logic is the same) ...

  const sendWelcomeEmail = async (user: UserProfile) => {
    try {
      // CORRECT: Calling the method on the 'emailService' instance
      await emailService.sendEmail({
        to: [user.email],
        subject: `Welcome to OphthalmoTech - ${user.first_name}`,
        html: `...` // Your welcome email HTML
      });
      // ... (toast logic)
    } catch (error) {
      // ... (toast logic)
    }
  };

  const generateUserReport = async () => {
    try {
      // ... (AI analysis logic) ...
      const reportHtml = `...`; // Your report HTML

      // CORRECT: Calling the method on the 'emailService' instance
      await emailService.sendEmail({
        to: [users.find(u => u.role === 'admin')?.email || 'admin@ophthalmtech.com'],
        subject: `OphthalmoTech User Management Report - ${new Date().toLocaleDateString()}`,
        html: reportHtml,
      });
      // ... (toast logic)
    } catch (error) {
      // ... (toast logic)
    }
  };

  // ... (Rest of the component JSX) ...
  return ( <div>...</div> );
}

// ... (Sub-components like CreateUserForm, EditUserForm remain the same) ...
