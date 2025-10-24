import React, { useState, useEffect } from 'react';
import { Link, UserPlus, Calendar, Clock, Trash2, Copy, CheckCircle, XCircle, Gift, Plus, Eye, EyeOff } from 'lucide-react';
import { AdminService } from '../services/adminService';

interface InvitationManagerProps {
  onInvitationCreated?: (invitation: any) => void;
}

const InvitationManager: React.FC<InvitationManagerProps> = ({ onInvitationCreated }) => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [trialDays, setTrialDays] = useState(7);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUsed, setShowUsed] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createInvitation = async () => {
    try {
      setIsLoading(true);
      const code = await AdminService.createInvitation(trialDays);
      await loadInvitations(); // Reload to get the full invitation object
      
      if (onInvitationCreated) {
        onInvitationCreated({ code, trialDays });
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('Fehler beim Erstellen der Einladung');
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateInvitation = async (id: string) => {
    try {
      await AdminService.deactivateInvitation(id);
      await loadInvitations();
    } catch (error) {
      console.error('Error deactivating invitation:', error);
      alert('Fehler beim Deaktivieren der Einladung');
    }
  };

  const deleteInvitation = async (id: string) => {
    if (!confirm('Einladung wirklich löschen?')) return;
    
    try {
      await AdminService.deleteInvitation(id);
      await loadInvitations();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      alert('Fehler beim Löschen der Einladung');
    }
  };

  const copyInvitationLink = (code: string) => {
    const link = `${window.location.origin}?invite=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const getInvitationStatus = (invitation: any) => {
    if (!invitation.is_active) return { status: 'deactivated', color: 'text-gray-500', bg: 'bg-gray-50', label: 'Deaktiviert' };
    if (invitation.used_by) return { status: 'used', color: 'text-green-600', bg: 'bg-green-50', label: 'Verwendet' };
    if (new Date(invitation.expires_at) < new Date()) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-50', label: 'Abgelaufen' };
    return { status: 'active', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Aktiv' };
  };

  const activeInvitations = invitations.filter(inv => 
    inv.is_active && !inv.used_by && new Date(inv.expires_at) > new Date()
  );
  const usedInvitations = invitations.filter(inv => inv.used_by);
  const expiredInvitations = invitations.filter(inv => 
    !inv.used_by && (new Date(inv.expires_at) <= new Date() || !inv.is_active)
  );

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 p-6 text-center">
          <div className="text-3xl font-black text-blue-600">{activeInvitations.length}</div>
          <div className="text-sm font-medium text-blue-700">Aktive Einladungen</div>
        </div>
        <div className="bg-green-50 border-2 border-green-200 p-6 text-center">
          <div className="text-3xl font-black text-green-600">{usedInvitations.length}</div>
          <div className="text-sm font-medium text-green-700">Verwendet</div>
        </div>
        <div className="bg-red-50 border-2 border-red-200 p-6 text-center">
          <div className="text-3xl font-black text-red-600">{expiredInvitations.length}</div>
          <div className="text-sm font-medium text-red-700">Abgelaufen</div>
        </div>
        <div className="bg-gray-50 border-2 border-gray-200 p-6 text-center">
          <div className="text-3xl font-black text-gray-600">{invitations.length}</div>
          <div className="text-sm font-medium text-gray-700">Gesamt</div>
        </div>
      </div>

      {/* Create New Invitation */}
      <div className="bg-white border-2 border-gray-900 shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center gap-3">
            <Plus className="h-6 w-6" />
            <h3 className="text-xl font-black">NEUE TESTVERSION ERSTELLEN</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Testversion Dauer (Tage)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={trialDays}
                onChange={(e) => setTrialDays(parseInt(e.target.value) || 7)}
                className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-bold text-center"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={createInvitation}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Erstelle...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Einladung erstellen
                  </>
                )}
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowUsed(!showUsed)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-colors"
              >
                {showUsed ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                {showUsed ? 'Verwendete ausblenden' : 'Verwendete anzeigen'}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-blue-800">Testversion Details</span>
            </div>
            <p className="text-sm text-blue-700">
              Neue Benutzer erhalten {trialDays} Tage kostenlosen Vollzugriff. 
              Nach Ablauf wird das Konto automatisch auf "Free" gesetzt.
            </p>
          </div>
        </div>
      </div>

      {/* Active Invitations */}
      <div className="bg-white border-2 border-gray-900 shadow-lg">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link className="h-6 w-6" />
              <h3 className="text-xl font-black">AKTIVE EINLADUNGEN ({activeInvitations.length})</h3>
            </div>
            {isLoading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
        
        <div className="p-6">
          {activeInvitations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Link className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Keine aktiven Einladungen</p>
              <p className="text-sm">Erstellen Sie eine neue Einladung, um Benutzer einzuladen.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInvitations.map((invitation) => {
                const status = getInvitationStatus(invitation);
                return (
                  <div key={invitation.id} className="border-2 border-gray-200 hover:border-gray-400 transition-colors">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="font-mono text-3xl font-black text-gray-900 bg-gray-100 px-4 py-2">
                            {invitation.code}
                          </div>
                          <div className={`px-4 py-2 border-2 text-sm font-bold ${status.bg} ${status.color}`}>
                            {invitation.trial_days} Tage Testversion
                          </div>
                          <div className={`px-3 py-1 text-xs font-bold ${status.bg} ${status.color}`}>
                            {status.label}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyInvitationLink(invitation.code)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                          >
                            {copiedCode === invitation.code ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Kopiert!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Link kopieren
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => deactivateInvitation(invitation.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 transition-colors"
                            title="Deaktivieren"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => deleteInvitation(invitation.id)}
                            className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Erstellt:</span><br />
                          {new Date(invitation.created_at).toLocaleDateString('de-DE')}
                        </div>
                        <div>
                          <span className="font-medium">Gültig bis:</span><br />
                          {new Date(invitation.expires_at).toLocaleDateString('de-DE')}
                        </div>
                        <div>
                          <span className="font-medium">Verbleibende Tage:</span><br />
                          <span className="font-bold text-blue-600">
                            {Math.max(0, Math.ceil((new Date(invitation.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Einladungslink:</span><br />
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            ?invite={invitation.code}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Vollständiger Link:</span><br />
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded truncate">
                            {window.location.origin}?invite={invitation.code}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Used Invitations */}
      {showUsed && usedInvitations.length > 0 && (
        <div className="bg-white border-2 border-gray-900 shadow-lg">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-xl font-black">VERWENDETE EINLADUNGEN ({usedInvitations.length})</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {usedInvitations.map((invitation) => (
                <div key={invitation.id} className="border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-lg font-bold text-green-800">
                        {invitation.code}
                      </div>
                      <div className="text-sm text-green-700">
                        <span className="font-medium">Verwendet von:</span> <span className="font-bold">{invitation.used_by}</span>
                      </div>
                      <div className="text-sm text-green-600">
                        <span className="font-medium">Testversion:</span> {invitation.trial_days} Tage
                      </div>
                    </div>
                    
                    <div className="text-sm text-green-600">
                      {invitation.used_at && new Date(invitation.used_at).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expired/Inactive Invitations */}
      {expiredInvitations.length > 0 && (
        <div className="bg-white border-2 border-gray-900 shadow-lg">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6" />
              <h3 className="text-xl font-black">ABGELAUFENE EINLADUNGEN ({expiredInvitations.length})</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {expiredInvitations.map((invitation) => {
                const status = getInvitationStatus(invitation);
                return (
                  <div key={invitation.id} className="border-2 border-red-200 bg-red-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-lg font-bold text-red-800">
                          {invitation.code}
                        </div>
                        <div className={`px-3 py-1 text-xs font-bold ${status.bg} ${status.color}`}>
                          {status.label}
                        </div>
                        <div className="text-sm text-red-700">
                          Abgelaufen: {new Date(invitation.expires_at).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteInvitation(invitation.id)}
                        className="p-2 text-red-600 hover:bg-red-100 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationManager;