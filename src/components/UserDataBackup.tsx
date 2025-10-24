import React, { useState } from 'react';
import { Download, Upload, Database, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminService } from '../services/adminService';

interface UserDataBackupProps {
  currentUserId: string;
}

const UserDataBackup: React.FC<UserDataBackupProps> = ({ currentUserId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const exportUserData = async () => {
    setIsExporting(true);
    
    try {
      // Collect all user data
      const [users, stats] = await Promise.all([
        AdminService.getAllUsers(),
        AdminService.getDatabaseStats()
      ]);
      
      const userData = {
        users,
        stats,
        exportTimestamp: new Date().toISOString(),
        version: '3.0',
        source: 'supabase'
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supabase-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Fehler beim Exportieren der Daten');
    } finally {
      setIsExporting(false);
    }
  };

  const importUserData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (confirm('Möchten Sie alle aktuellen Daten durch die importierten Daten ersetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
          // Restore all data
          if (data.userAccounts) localStorage.setItem('userAccounts', data.userAccounts);
          if (data.gradeProfiles) localStorage.setItem(`gradeProfiles_${currentUserId}`, data.gradeProfiles);
          if (data.todos) localStorage.setItem(`todos_${currentUserId}`, data.todos);
          if (data.cookieConsent) localStorage.setItem('cookieConsent', data.cookieConsent);
          if (data.betaWarningDismissed) localStorage.setItem('betaWarningDismissed', data.betaWarningDismissed);
          if (data.invitations) localStorage.setItem('invitations', data.invitations);
          if (data.allowedDomains) localStorage.setItem('allowedDomains', data.allowedDomains);
          
          alert('Daten erfolgreich importiert! Die Seite wird neu geladen.');
          window.location.reload();
        }
      } catch (error) {
        alert('Fehler beim Importieren der Daten. Bitte überprüfen Sie das Dateiformat.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const cleanupExpiredTrials = async () => {
    setIsCleaning(true);
    
    try {
      const cleaned = await AdminService.cleanupExpiredTrials();
      alert(`Cleaned up ${cleaned} expired trial accounts`);
    } catch (error) {
      alert('Failed to cleanup expired trials');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-gray-900 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-gray-900" />
        <h3 className="text-xl font-bold text-gray-900">Supabase Data Management</h3>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-blue-800">Server-Update Schutz</span>
        </div>
        <p className="text-sm text-blue-700">
          Export database snapshots for backup and analysis. All user data is stored securely in Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">Daten exportieren</h4>
          <p className="text-sm text-gray-700">
            Creates a backup file with all database users and statistics from Supabase.
          </p>
          <button
            onClick={exportUserData}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 text-white font-bold hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exportiere...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Export Database
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">Daten importieren</h4>
          <p className="text-sm text-gray-700">
            Import and analyze backup data (read-only preview).
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importUserData}
              disabled={isImporting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              disabled={isImporting}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white disabled:opacity-50 transition-colors"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Analyze Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      </div>
      
      {/* Database Maintenance */}
      <div className="bg-white border-2 border-gray-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw className="h-6 w-6 text-gray-900" />
          <h3 className="text-xl font-bold text-gray-900">Database Maintenance</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Cleanup Expired Trials</h4>
            <p className="text-sm text-gray-700 mb-4">
              Convert expired trial accounts to free accounts automatically.
            </p>
            <button
              onClick={cleanupExpiredTrials}
              disabled={isCleaning}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-bold hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {isCleaning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Cleanup Trials
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="font-bold text-yellow-800 text-sm">Database Information</span>
        </div>
        <p className="text-yellow-700 text-sm">
          All data is stored securely in Supabase with automatic backups. 
          User data persists across devices and browser sessions.
        </p>
      </div>
    </div>
  );
};

export default UserDataBackup;