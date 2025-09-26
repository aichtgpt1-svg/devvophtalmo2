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

