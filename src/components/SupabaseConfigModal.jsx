import React, { useState } from 'react';
import { saveSupabaseConfig, clearSupabaseConfig, isSupabaseConnected } from '../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react';

export const SupabaseConfigModal = ({ onClose }) => {
  const [url, setUrl] = useState(localStorage.getItem('shibuya_supabase_url') || '');
  const [key, setKey] = useState(localStorage.getItem('shibuya_supabase_key') || '');

  const connected = isSupabaseConnected();

  const handleSave = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
  };

  const handleReset = () => {
    clearSupabaseConfig();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border-t-8 border-[#125938]">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#8C4580]" />
            Configuração do Supabase (Banco de Dados)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          connected ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-amber-50 text-amber-900 border-amber-300'
        }`}>
          {connected ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Conectado ao Supabase</p>
                <p className="text-[11px] opacity-80">As operações estão sincronizadas com o banco Supabase em nuvem.</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Modo Armazenamento Local (Offline / Fallback)</p>
                <p className="text-[11px] opacity-80">
                  Sem credenciais remotas ativas. Os dados são salvos localmente e funcionam 100% offline. Preencha abaixo para conectar ao seu banco Supabase.
                </p>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Supabase URL Project</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938] font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Supabase Public Anon Key</label>
            <textarea
              rows={3}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938] font-mono text-[11px]"
            ></textarea>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-red-600 hover:text-red-800 underline font-semibold"
            >
              Restaurar Padrão Local
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Fechar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#125938] hover:bg-[#06402F] text-white rounded font-bold shadow"
              >
                Salvar & Reconectar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
