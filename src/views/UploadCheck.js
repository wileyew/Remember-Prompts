import React, { useCallback, useState } from 'react';

const prettyBytes = (num) => {
  if (num < 1024) return `${num} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  do {
    num = num / 1024;
    i++;
  } while (num >= 1024 && i < units.length - 1);
  return `${num.toFixed(1)} ${units[i]}`;
};

const UploadCheck = () => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const onSelectFile = useCallback((f) => {
    setFile(f);
    setResult(null);
    setError('');
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelectFile(e.dataTransfer.files[0]);
    }
  };

  const onBrowse = (e) => {
    if (e.target.files && e.target.files[0]) {
      onSelectFile(e.target.files[0]);
    }
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    setProgress(0);
    try {
      const body = new FormData();
      body.append('file', file);
      const base = process.env.REACT_APP_API_BASE_URL || '';
      const response = await fetch(`${base}/upload`, {
        method: 'POST',
        body,
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Upload failed');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  return (
    <div className="upload-page">
      <div className="apple-card">
        <h1 className="page-title">Upload for Copyright Check</h1>
        <p className="muted">PDF, DOCX, or TXT up to 100MB.</p>
        <div
          className={`dropzone ${dragOver ? 'drag' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={onBrowse}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="browse-hint">
            Drag & drop a file here, or click to browse
          </label>
        </div>

        {file && (
          <div className="file-summary">
            <div className="file-name">{file.name}</div>
            <div className="file-meta">{prettyBytes(file.size)}</div>
          </div>
        )}

        <div className="actions">
          <button
            className="apple-btn primary"
            disabled={!file || uploading}
            onClick={upload}
          >
            {uploading ? 'Uploading…' : 'Upload & Analyze'}
          </button>
          <button
            className="apple-btn"
            disabled={uploading && !file}
            onClick={() => { setFile(null); setResult(null); setError(''); }}
          >
            Clear
          </button>
        </div>

        {uploading && (
          <div className="progress">
            <div className="bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result apple-card subtle">
            <h2 className="section-title">Analysis</h2>
            <div className="kv">
              <div><strong>File</strong></div>
              <div>{result.file?.name} ({prettyBytes(result.file?.sizeBytes || 0)})</div>
            </div>
            {result.meta?.pages && (
              <div className="kv">
                <div><strong>Pages</strong></div>
                <div>{result.meta.pages}</div>
              </div>
            )}
            <div className="kv">
              <div><strong>Words</strong></div>
              <div>{result.stats?.wordCount || 0}</div>
            </div>
            <div className="kv">
              <div><strong>Characters</strong></div>
              <div>{result.stats?.charCount || 0}</div>
            </div>
            <div className={`badge ${result.potentialRisk ? 'warn' : 'ok'}`}>
              {result.potentialRisk ? 'Potentially lengthy — review for copyright risk' : 'Low risk based on length'}
            </div>
            <div className="preview">
              <div className="preview-label">Preview (first 1000 chars)</div>
              <pre className="preview-box">{result.preview || ''}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCheck;

