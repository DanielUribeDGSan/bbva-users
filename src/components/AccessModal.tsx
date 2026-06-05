import React, { useState, useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';

export default function AccessModal() {
  const [hasAccess, setHasAccess] = useState(true);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check localStorage on mount
    const access = localStorage.getItem('site_access_granted');
    if (access !== 'true') {
      setHasAccess(false);
    }
  }, []);

  if (hasAccess) return null;

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle edge cases where multiple characters are pasted into one input directly without triggering onPaste
      value = value.slice(0, 1);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(false);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check code if all filled
    if (newCode.every(c => c !== '') && newCode.length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move back on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!pastedData) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newCode[i] = pastedData[i];
    }
    setCode(newCode);
    setError(false);

    if (pastedData.length === 6) {
      verifyCode(newCode.join(''));
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const verifyCode = (enteredCode: string) => {
    // 'k7R9Wp' encoded in base64 is 'azdSOVdw'
    if (btoa(enteredCode) === 'azdSOVdw') {
      localStorage.setItem('site_access_granted', 'true');
      setHasAccess(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white/20 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl p-10 md:p-12 max-w-[500px] w-full border border-gray-100 flex flex-col items-center transform transition-all">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Acceso Restringido</h2>
        <p className="text-gray-500 text-center mb-8 px-4">
          Por favor, ingrese el código de acceso para continuar al sitio.
        </p>

        <div className="flex gap-3 sm:gap-4 mb-8 w-full justify-center" onPaste={handlePaste}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="password"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className={`w-12 h-12 sm:w-16 sm:h-16 text-center text-2xl font-semibold border-2 rounded-xl sm:rounded-2xl outline-none transition-all ${
                error 
                  ? 'border-red-400 bg-red-50 text-red-600' 
                  : digit 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium mb-4 animate-pulse">
            Código incorrecto. Inténtelo de nuevo.
          </p>
        )}

        <button 
          onClick={() => verifyCode(code.join(''))}
          disabled={code.some(c => !c)}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 sm:py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          Verificar
        </button>
      </div>
    </div>
  );
}
