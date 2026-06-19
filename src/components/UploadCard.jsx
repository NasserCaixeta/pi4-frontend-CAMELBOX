import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import ProgressBar from './ProgressBar';

export default function UploadCard({ onUploadComplete, compact = false, onDeleteMonth, canDeleteMonth = false, onShowPlans }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | completed | error
  const [errorMsg, setErrorMsg] = useState('');
  const [isPaywall, setIsPaywall] = useState(false);
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
    if (status !== 'idle') return;

    if (!file || (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name || ''))) {
      setErrorMsg('Apenas arquivos PDF são aceitos');
      setStatus('error');
      return;
    }

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus('uploading');
    setErrorMsg('');

    try {
      const statement = await api.upload('/statements/upload', file);
      setStatus('processing');
      startPolling(statement.id);
    } catch (err) {
      if (err.status === 402) {
        setErrorMsg(err.message || 'Limite de análises atingido. Assine para continuar.');
        setIsPaywall(true);
      } else if (err.status === 409) {
        setErrorMsg('Este extrato já foi enviado anteriormente.');
        setIsPaywall(false);
      } else {
        setErrorMsg(err.message || 'Erro ao enviar arquivo');
        setIsPaywall(false);
      }
      setStatus('error');
    }
  };

  const startPolling = (statementId) => {
    timeoutRef.current = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      timeoutRef.current = null;
      setErrorMsg('Tempo limite excedido. Tente novamente.');
      setStatus('error');
    }, 60000);

    pollingRef.current = setInterval(async () => {
      try {
        const stmt = await api.get(`/statements/${statementId}`);
        if (stmt.status === 'completed') {
          clearInterval(pollingRef.current);
          clearTimeout(timeoutRef.current);
          pollingRef.current = null;
          timeoutRef.current = null;
          setStatus('completed');
          setTimeout(() => {
            setStatus('idle');
            onUploadComplete();
          }, 2000);
        } else if (stmt.status === 'error') {
          clearInterval(pollingRef.current);
          clearTimeout(timeoutRef.current);
          pollingRef.current = null;
          timeoutRef.current = null;
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
    setIsPaywall(false);
  };

  // ─── Compact layout (with data) ───
  if (compact) {
    return (
      <div className="cb-upload-compact">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="cb-file-input"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {status === 'idle' && (
          <>
            <span className="cb-upload-compact__text">
              Envie um novo extrato para atualizar seus dados
            </span>
            <div className="cb-upload-compact__actions">
              {canDeleteMonth && (
                <button onClick={onDeleteMonth} className="cb-button cb-button--danger cb-button--compact">
                  Remover mês
                </button>
              )}
              <button onClick={handleClick} className="cb-button cb-button--outline cb-button--compact">
                Enviar PDF
              </button>
            </div>
          </>
        )}

        {status === 'uploading' && (
          <div className="cb-upload-compact__progress">
            <ProgressBar label="Enviando arquivo..." />
          </div>
        )}

        {status === 'processing' && (
          <div className="cb-upload-compact__progress">
            <ProgressBar label="Analisando extrato com IA..." />
          </div>
        )}

        {status === 'completed' && (
          <span className="cb-upload-compact__success">Extrato processado com sucesso!</span>
        )}

        {status === 'error' && (
          <div className="cb-upload-compact__error">
            <span className="cb-upload-compact__error-message">{errorMsg}</span>
            {isPaywall && onShowPlans && (
              <button onClick={onShowPlans} className="cb-button cb-button--outline cb-button--small">
                Ver planos
              </button>
            )}
            <button onClick={reset} className="cb-button cb-button--ghost cb-button--small">
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Full layout (empty state) ───
  return (
    <div className="cb-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="cb-file-input"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); if (status === 'idle') setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={status === 'idle' ? handleClick : undefined}
        className={`cb-upload__dropzone${dragOver ? ' is-dragging' : ''}${status !== 'idle' ? ' is-busy' : ''}`}
      >
        {status === 'idle' && (
          <>
            <div className="cb-upload__icon">📄</div>
            <div className="cb-upload__title">
              Envie seu primeiro extrato para começar a análise
            </div>
            <div className="cb-upload__hint">
              Arraste um PDF aqui ou clique para selecionar
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleClick(); }} className="cb-button cb-button--primary">
              Selecionar PDF
            </button>
          </>
        )}

        {status === 'uploading' && (
          <div className="cb-upload__progress">
            <ProgressBar label="Enviando arquivo..." />
          </div>
        )}

        {status === 'processing' && (
          <div className="cb-upload__progress">
            <ProgressBar
              label="Analisando extrato com IA..."
              sublabel="Isso pode levar alguns segundos"
            />
          </div>
        )}

        {status === 'completed' && (
          <>
            <div className="cb-upload__status-icon">✅</div>
            <div className="cb-upload__message cb-upload__message--success">Extrato processado com sucesso!</div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="cb-upload__status-icon">❌</div>
            <div className="cb-upload__message cb-upload__message--error">{errorMsg}</div>
            <div className="cb-upload__actions">
              {isPaywall && onShowPlans && (
                <button onClick={(e) => { e.stopPropagation(); onShowPlans(); }} className="cb-button cb-button--primary cb-button--compact">
                  Ver planos
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); reset(); }} className="cb-button cb-button--ghost cb-button--compact">
                Tentar novamente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
