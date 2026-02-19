import { useState } from 'react';
import { uploadFile, uploadText, BRD, getPdfUrl, getDocxUrl } from './api/api';
import { Upload, Download, Wand2, AlertTriangle, Calendar } from 'lucide-react';

function App() {
    const [brd, setBrd] = useState<BRD | null>(null);
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            try {
                const result = await uploadFile(e.target.files[0]);
                setBrd(result);
            } catch (error) {
                console.error("Upload failed", error);
                alert("Upload failed. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleTextUpload = async () => {
        if (!textInput.trim()) return;
        setLoading(true);
        try {
            const result = await uploadText(textInput);
            setBrd(result);
        } catch (error) {
            console.error("Extraction failed", error);
            alert("Extraction failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>BRDify Agent</h1>
                <p>Transform chaos into structured requirements.</p>
            </header>

            {!brd && !loading && (
                <div className="section">
                    <h2>Input Source</h2>
                    <div className="upload-zone" onClick={() => document.getElementById('file-upload')?.click()}>
                        <Upload size={48} className="mb-4 text-gray-400" />
                        <p>Click to upload transcript or email file</p>
                        <input
                            id="file-upload"
                            type="file"
                            hidden
                            onChange={handleFileUpload}
                            accept=".txt,.pdf" // Accepting txt/pdf but backend handles txt best for now
                        />
                    </div>

                    <div style={{ textAlign: 'center', margin: '1rem' }}>OR</div>

                    <div>
                        <textarea
                            rows={10}
                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            placeholder="Paste email content or transcript here..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                        />
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button className="btn" onClick={handleTextUpload}>
                                <Wand2 size={18} /> Generate BRD
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading">
                    <Wand2 size={48} className="animate-spin" />
                    <p>Analyzing conversation and extracting requirements...</p>
                </div>
            )}

            {brd && (
                <div className="brd-preview fade-in">
                    <div className="section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>{brd.title}</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <a href={getPdfUrl(brd.id)} target="_blank" className="btn" style={{ background: '#ef4444' }}>
                                    <Download size={18} /> PDF
                                </a>
                                <a href={getDocxUrl(brd.id)} target="_blank" className="btn" style={{ background: '#3b82f6' }}>
                                    <Download size={18} /> DOCX
                                </a>
                            </div>
                        </div>

                        <h3>Requirements</h3>
                        <ul>
                            {brd.requirements.map((req, i) => (
                                <li key={i} className="list-item">{req.description}</li>
                            ))}
                        </ul>

                        <h3>Decisions</h3>
                        <ul>
                            {brd.decisions.map((dec, i) => (
                                <li key={i} className="list-item">{dec.description}</li>
                            ))}
                        </ul>

                        <h3>Stakeholders</h3>
                        <ul>
                            {brd.stakeholders.map((sh, i) => (
                                <li key={i} className="list-item">{sh.name} - {sh.role}</li>
                            ))}
                        </ul>

                        <h3><AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px' }} />Risks</h3>
                        {brd.risks && brd.risks.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                                <thead>
                                    <tr style={{ background: '#f3f4f6' }}>
                                        <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Description</th>
                                        <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Impact</th>
                                        <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Mitigation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brd.risks.map((risk, i) => (
                                        <tr key={i}>
                                            <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{risk.description}</td>
                                            <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{risk.impact}</td>
                                            <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{risk.mitigation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p>No risks identified.</p>}

                        <h3><Calendar size={18} style={{ display: 'inline', marginRight: '8px' }} />Timeline</h3>
                        {brd.timelines && brd.timelines.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {brd.timelines.map((t, i) => (
                                    <li key={i} className="list-item" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '100px' }}>{t.milestone}</span>
                                        <span style={{ color: '#6b7280' }}>{t.expectedDate}</span>
                                        <span>{t.description}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p>No timeline milestones identified.</p>}


                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button className="btn" style={{ background: 'gray' }} onClick={() => setBrd(null)}>
                                Start New
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
