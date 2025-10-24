import React, { useState, useEffect } from 'react';
import { AuthService, AuthUser } from '../services/authService';
import { User, Settings, Key, LogOut, X } from 'lucide-react';

interface AccountManagerProps {
  currentUserId: string;
  onLogout: () => void;
  variant?: 'uniform' | 'standalone';
}

const AccountManager: React.FC<AccountManagerProps> = ({
  currentUserId,
  onLogout,
  variant = 'standalone'
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      const user = await AuthService.getCurrentUser(currentUserId);
      setCurrentUser(user);
    } catch (error) {
      console.error('Fehler beim Laden des Benutzers:', error);
      setMessage({ type: 'error', text: 'Fehler beim Laden der Benutzerdaten' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!currentUser) return;

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein' });
      return;
    }

    try {
      setSaveLoading(true);
      setMessage(null);

      // Passwort zurücksetzen, falls angegeben
      if (newPassword) {
        await AuthService.resetPassword(currentUser.id, newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      // Benutzerdaten aktualisieren
      await AuthService.updateUser(currentUser.id, {
        displayName: currentUser.displayName,
        paymentStatus: currentUser.paymentStatus
      });

      setMessage({ type: 'success', text: 'Änderungen erfolgreich gespeichert' });
      setIsEditing(false);
      
      // Nachricht nach 3 Sekunden ausblenden
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Änderungen' });
    } finally {
      setSaveLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!currentUser) return null;

    if (currentUser.isAdmin) {
      return {
        text: 'ADMIN',
        color: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
      };
    }
    if (currentUser.isSchoolManager) {
      return {
        text: 'SCHULMANAGER',
        color: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
      };
    }
    switch (currentUser.paymentStatus) {
      case 'paid':
        return {
          text: 'PREMIUM',
          color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
        };
      default:
        return {
          text: 'BASIC',
          color: 'bg-gray-200 text-gray-700',
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Uniform Button für die Navigation
  if (variant === 'uniform' && !isMenuOpen) {
    return (
      <button
        onClick={() => setIsMenuOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg"
      >
        <User className="h-4 w-4" />
        <span>Konto</span>
      </button>
    );
  }

  // Modal für das Benutzermenü
  if (isMenuOpen) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Account Menu Modal */}
        <div className="fixed inset-4 z-50 flex items-center justify-center">
          <div className="bg-white border-4 border-gray-900 shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      MEIN KONTO
                    </h2>
                    <p className="text-gray-300 font-medium">
                      Persönliche Einstellungen
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-lg flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* User Info */}
              <div className="relative mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentUser?.email && (
                    <div className="text-sm text-gray-300 font-medium bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                      {currentUser.email}
                    </div>
                  )}
                </div>

                {statusBadge && (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusBadge.color} font-bold text-sm`}
                  >
                    <span>{statusBadge.text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Message */}
                  {message && (
                    <div
                      className={`p-4 rounded-lg border-2 ${
                        message.type === 'success'
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  {/* Benutzerinformationen */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Benutzerinformationen
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-Mail
                        </label>
                        <input
                          type="email"
                          value={currentUser?.email || ''}
                          disabled
                          className="w-full px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Anzeigename
                        </label>
                        <input
                          type="text"
                          value={currentUser?.displayName || ''}
                          onChange={(e) => setCurrentUser(prev => 
                            prev ? { ...prev, displayName: e.target.value } : null
                          )}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Ihr Anzeigename"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Benutzer-ID
                        </label>
                        <input
                          type="text"
                          value={currentUser?.id || ''}
                          disabled
                          className="w-full px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-600 text-xs font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Passwort zurücksetzen */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Passwort ändern
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Neues Passwort
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passwort bestätigen
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account-Status */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Account-Status
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">
                          {statusBadge?.text || 'BASIC'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rolle:</span>
                        <span className="font-medium">
                          {currentUser?.isAdmin 
                            ? 'Administrator' 
                            : currentUser?.isSchoolManager 
                            ? 'Schulmanager' 
                            : 'Benutzer'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registriert:</span>
                        <span className="font-medium">
                          {currentUser?.createdAt 
                            ? new Date(currentUser.createdAt).toLocaleDateString('de-DE')
                            : 'Unbekannt'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t-4 border-gray-900 p-6 bg-white flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Bearbeiten</span>
                    </button>

                    <button
                      onClick={onLogout}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 bg-red-600 text-white font-bold hover:bg-red-700 hover:border-red-700 transition-all duration-300 rounded-lg"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Abmelden</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setMessage(null);
                        loadCurrentUser(); // Daten zurücksetzen
                      }}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 bg-gray-300 text-gray-700 font-bold hover:bg-gray-400 hover:border-gray-400 transition-all duration-300 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                      <span>Abbrechen</span>
                    </button>

                    <button
                      onClick={handleSaveChanges}
                      disabled={saveLoading}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-green-600 bg-green-600 text-white font-bold hover:bg-green-700 hover:border-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg"
                    >
                      {saveLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Settings className="h-4 w-4" />
                      )}
                      <span>{saveLoading ? 'Speichern...' : 'Speichern'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Standalone Ansicht (für separate Seite)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-4 border-gray-900 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black">MEIN KONTO</h1>
                <p className="text-gray-300">Persönliche Einstellungen verwalten</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hier würde der gleiche Content wie im Modal stehen */}
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Verwenden Sie das Konto-Menü in der Navigation für persönliche Einstellungen.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;