import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Download, Copy, CheckCircle, Settings, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';

const QRCodeGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const options = {
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        },
        errorCorrectionLevel: errorLevel
      };
      
      const url = await QRCode.toDataURL(text, options);
      setQrCodeUrl(url);
      
      // Also draw to canvas for download functionality
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, options);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback: copy the data URL
      navigator.clipboard.writeText(qrCodeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const presetTexts = [
    { label: 'Website URL', value: window.location.origin },
    { label: 'WiFi Verbindung', value: 'WIFI:T:WPA;S:MeinWiFi;P:MeinPasswort;H:false;;' },
    { label: 'E-Mail Adresse', value: 'mailto:beispiel@email.de' },
    { label: 'Telefonnummer', value: 'tel:+491234567890' },
    { label: 'SMS', value: 'sms:+491234567890?body=Hallo!' },
    { label: 'WhatsApp', value: 'https://wa.me/491234567890' }
  ];

  useEffect(() => {
    if (text.trim()) {
      const debounceTimer = setTimeout(() => {
        generateQRCode();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    } else {
      setQrCodeUrl('');
    }
  }, [text, size, errorLevel, foregroundColor, backgroundColor]);

  return (
    <div className="bg-white border-2 border-gray-900 shadow-lg p-8">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-900">
        <QrCode className="h-8 w-8 text-gray-900" />
        <h2 className="text-3xl font-bold text-gray-900">QR-Code Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Text oder URL eingeben
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Geben Sie hier den Text oder die URL ein, die als QR-Code generiert werden soll..."
              className="w-full px-4 py-4 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium resize-none"
              rows={4}
            />
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Schnellauswahl
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetTexts.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setText(preset.value)}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 text-gray-900 font-medium hover:bg-gray-200 transition-colors text-sm text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gray-50 border-2 border-gray-900 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-gray-900" />
              <h3 className="text-xl font-bold text-gray-900">Einstellungen</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Größe (px)
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
                >
                  <option value={128}>128x128</option>
                  <option value={256}>256x256</option>
                  <option value={512}>512x512</option>
                  <option value={1024}>1024x1024</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Fehlerkorrektur
                </label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="w-full px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-medium"
                >
                  <option value="L">Niedrig (7%)</option>
                  <option value="M">Mittel (15%)</option>
                  <option value="Q">Hoch (25%)</option>
                  <option value="H">Sehr hoch (30%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Vordergrundfarbe
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-12 h-10 border-2 border-gray-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-mono text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Hintergrundfarbe
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 border-2 border-gray-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-gray-900 focus:outline-none focus:border-gray-600 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-4 border-gray-900 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">QR-Code Vorschau</h3>
            
            <div className="flex items-center justify-center min-h-[300px]">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium text-gray-700">Generiere QR-Code...</span>
                </div>
              ) : qrCodeUrl ? (
                <div className="text-center">
                  <img
                    src={qrCodeUrl}
                    alt="Generated QR Code"
                    className="mx-auto border-2 border-gray-300 shadow-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <QrCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Geben Sie Text ein, um einen QR-Code zu generieren</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {qrCodeUrl && (
            <div className="flex gap-4">
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white font-bold hover:bg-gray-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                Herunterladen
              </button>
              
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Kopieren
                  </>
                )}
              </button>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 border-2 border-gray-900 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="h-6 w-6 text-gray-900" />
              <h4 className="text-lg font-bold text-gray-900">Verwendung</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>URLs:</strong> Direkte Weiterleitung zu Websites</p>
              <p><strong>WiFi:</strong> Format: WIFI:T:WPA;S:Netzwerkname;P:Passwort;H:false;;</p>
              <p><strong>Kontakt:</strong> vCard-Format für Kontaktdaten</p>
              <p><strong>E-Mail:</strong> mailto:adresse@domain.de</p>
              <p><strong>Telefon:</strong> tel:+491234567890</p>
              <p><strong>SMS:</strong> sms:+491234567890?body=Nachricht</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;