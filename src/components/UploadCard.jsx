import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: "#0F0D08",
  surface: "#1C1810",
  card: "#231F14",
  border: "#3A3120",
  borderHover: "#5A4E30",
  amber: "#D4A843",
  amberLight: "#E8C265",
  amberGlow: "rgba(212,168,67,0.1)",
  text: "#F5ECD7",
  textMuted: "#8A7A5A",
  success: "#5A9A6A",
  successBg: "rgba(90,154,106,0.12)",
  danger: "#C0503A",
  dangerBg: "rgba(192,80,58,0.12)",
};

export default function UploadCard({ onUploadComplete, compact = false, onDeleteMonth, canDeleteMonth = false }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | completed | error
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setErrorMsg('Apenas arquivos PDF são aceitos');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setErrorMsg('');

    try {
      const statement = await api.upload('/statements/upload', file);
      setStatus('processing');
      startPolling(statement.id);
    } catch (err) {
      if (err.status === 402) {
        setErrorMsg('Limite de análises gratuitas atingido. Assine para continuar.');
      } else if (err.status === 409) {
        setErrorMsg('Este extrato já foi enviado anteriormente.');
      } else {
        setErrorMsg(err.message || 'Erro ao enviar arquivo');
      }
      setStatus('error');
    }
  };

  const startPolling = (statementId) => {
    timeoutRef.current = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setErrorMsg('Tempo limite excedido. Tente novamente.');
      setStatus('error');
    }, 60000);

    pollingRef.current = setInterval(async () => {
      try {
        const stmt = await api.get(`/statements/${statementId}`);
        if (stmt.status === 'completed') {
          clearInterval(pollingRef.current);
          clearTimeout(timeoutRef.current);
          setStatus('completed');
          setTimeout(() => {
            setStatus('idle');
            onUploadComplete();
          }, 2000);
        } else if (stmt.status === 'error') {
          clearInterval(pollingRef.current);
          clearTimeout(timeoutRef.current);
          setErrorMsg('Erro ao processar o extrato. Tente novamente.');
          setStatus('error');
        }
      } catch {
        // Ignore polling errors, will retry
      }
    }, 3000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const reset = () => {
    setStatus('idle');
    setErrorMsg('');
  };

  // ─── Compact layout (with data) ───
  if (compact) {
    return (
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '0.75rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {status === 'idle' && (
          <>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              Envie um novo extrato para atualizar seus dados
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {canDeleteMonth && (
                <button onClick={onDeleteMonth} style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: `1px solid ${C.danger}`, background: 'transparent',
                  color: C.danger, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Remover mês
                </button>
              )}
              <button onClick={handleClick} style={{
                padding: '8px 16px', borderRadius: 8,
                border: `1px solid ${C.amber}`, background: C.amberGlow,
                color: C.amber, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Enviar PDF
              </button>
            </div>
          </>
        )}

        {status === 'uploading' && (
          <span style={{ fontSize: 13, color: C.amber }}>Enviando...</span>
        )}

        {status === 'processing' && (
          <span style={{ fontSize: 13, color: C.amber }}>Analisando extrato...</span>
        )}

        {status === 'completed' && (
          <span style={{ fontSize: 13, color: C.success }}>Extrato processado com sucesso!</span>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: C.danger }}>{errorMsg}</span>
            <button onClick={reset} style={{
              padding: '6px 12px', borderRadius: 8,
              border: `1px solid ${C.danger}`, background: 'transparent',
              color: C.danger, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Full layout (empty state) ───
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh',
    }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={status === 'idle' ? handleClick : undefined}
        style={{
          background: C.card,
          border: `2px dashed ${dragOver ? C.amber : C.border}`,
          borderRadius: 20, padding: '3rem 4rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1rem', cursor: status === 'idle' ? 'pointer' : 'default',
          transition: 'border-color 0.2s',
          maxWidth: 480, width: '100%',
        }}
      >
        {status === 'idle' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text, textAlign: 'center' }}>
              Envie seu primeiro extrato para começar a análise
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, textAlign: 'center' }}>
              Arraste um PDF aqui ou clique para selecionar
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleClick(); }} style={{
              marginTop: 8, padding: '10px 24px', borderRadius: 10,
              border: 'none', background: C.amber, color: C.bg,
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Selecionar PDF
            </button>
          </>
        )}

        {status === 'uploading' && (
          <>
            <div style={{ fontSize: 32 }}>⏳</div>
            <div style={{ fontSize: 15, color: C.amber }}>Enviando arquivo...</div>
          </>
        )}

        {status === 'processing' && (
          <>
            <div style={{ fontSize: 32 }}>🔍</div>
            <div style={{ fontSize: 15, color: C.amber }}>Analisando extrato...</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Isso pode levar alguns segundos</div>
          </>
        )}

        {status === 'completed' && (
          <>
            <div style={{ fontSize: 32 }}>✅</div>
            <div style={{ fontSize: 15, color: C.success }}>Extrato processado com sucesso!</div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 32 }}>❌</div>
            <div style={{ fontSize: 15, color: C.danger }}>{errorMsg}</div>
            <button onClick={(e) => { e.stopPropagation(); reset(); }} style={{
              marginTop: 8, padding: '8px 20px', borderRadius: 8,
              border: `1px solid ${C.danger}`, background: 'transparent',
              color: C.danger, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Tentar novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
}
