import { useState } from 'react';
import { uploadFile, uploadText, updateBrd, BRD, getPdfUrl, getDocxUrl } from './api/api';
import { Upload, Download, Wand2, AlertTriangle, Calendar, Edit, Save, Trash2, Plus } from 'lucide-react';

function App() {
    const [brd, setBrd] = useState<BRD | null>(null);
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editDraft, setEditDraft] = useState<BRD | null>(null);
    const [saving, setSaving] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            try {
                const result = await uploadFile(e.target.files[0]);
                setBrd(result);
                setEditDraft(result);
                setIsEditing(true); // default to edit mode after generation
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
            setEditDraft(result);
            setIsEditing(true); // default to edit mode after generation
        } catch (error) {
            console.error("Extraction failed", error);
            alert("Extraction failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBrd = async () => {
        if (!editDraft) return;
        setSaving(true);
        try {
            const result = await updateBrd(editDraft.id, editDraft);
            setBrd(result);
            setIsEditing(false); // Mode back to view
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const updateDraftArray = (field: keyof BRD, index: number, key: string, value: string) => {
        if (!editDraft) return;
        const newArray = [...(editDraft[field] as any[])];
        newArray[index] = { ...newArray[index], [key]: value };
        setEditDraft({ ...editDraft, [field]: newArray });
    };

    const removeDraftArrayItem = (field: keyof BRD, index: number) => {
        if (!editDraft) return;
        const newArray = [...(editDraft[field] as any[])];
        newArray.splice(index, 1);
        setEditDraft({ ...editDraft, [field]: newArray });
    };

    const addDraftArrayItem = (field: keyof BRD, emptyObj: any) => {
        if (!editDraft) return;
        setEditDraft({ ...editDraft, [field]: [...(editDraft[field] as any[]), emptyObj] });
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
                            accept=".txt,.pdf"
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

            {brd && editDraft && (
                <div className="brd-preview fade-in">
                    <div className="section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            {isEditing ? (
                                <input
                                    style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '60%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={editDraft.title}
                                    onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                                />
                            ) : (
                                <h2>{brd.title}</h2>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {isEditing ? (
                                    <button onClick={handleSaveBrd} className="btn" style={{ background: '#10b981' }} disabled={saving}>
                                        {saving ? <Wand2 className="animate-spin" size={18} /> : <Save size={18} />} {saving ? 'Saving...' : 'Save & Continue'}
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => { setEditDraft(brd); setIsEditing(true); }} className="btn" style={{ background: '#f59e0b', color: 'white' }}>
                                            <Edit size={18} /> Edit
                                        </button>
                                        <a href={getPdfUrl(brd.id)} target="_blank" className="btn" style={{ background: '#ef4444' }}>
                                            <Download size={18} /> PDF
                                        </a>
                                        <a href={getDocxUrl(brd.id)} target="_blank" className="btn" style={{ background: '#3b82f6' }}>
                                            <Download size={18} /> DOCX
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        {isEditing && <p style={{ color: '#64748b', marginBottom: '2rem' }}>Review the AI generated content below. Make any adjustments before downloading the final document.</p>}

                        {/* REQUIREMENTS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Requirements</h3>
                            {isEditing && <button onClick={() => addDraftArrayItem('requirements', { description: '' })} className="btn-icon" style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={20} /></button>}
                        </div>
                        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                            {(isEditing ? editDraft.requirements : brd.requirements).map((req, i) => (
                                <li key={i} className="list-item" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {isEditing ? (
                                        <>
                                            <input style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={req.description} onChange={(e) => updateDraftArray('requirements', i, 'description', e.target.value)} />
                                            <Trash2 size={20} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeDraftArrayItem('requirements', i)} />
                                        </>
                                    ) : (
                                        <span>• {req.description}</span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* DECISIONS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Decisions</h3>
                            {isEditing && <button onClick={() => addDraftArrayItem('decisions', { description: '' })} className="btn-icon" style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={20} /></button>}
                        </div>
                        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                            {(isEditing ? editDraft.decisions : brd.decisions).map((dec, i) => (
                                <li key={i} className="list-item" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {isEditing ? (
                                        <>
                                            <input style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={dec.description} onChange={(e) => updateDraftArray('decisions', i, 'description', e.target.value)} />
                                            <Trash2 size={20} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeDraftArrayItem('decisions', i)} />
                                        </>
                                    ) : (
                                        <span>• {dec.description}</span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* STAKEHOLDERS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Stakeholders</h3>
                            {isEditing && <button onClick={() => addDraftArrayItem('stakeholders', { name: '', role: '' })} className="btn-icon" style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={20} /></button>}
                        </div>
                        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                            {(isEditing ? editDraft.stakeholders : brd.stakeholders).map((sh, i) => (
                                <li key={i} className="list-item" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {isEditing ? (
                                        <>
                                            <input placeholder="Name" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={sh.name} onChange={(e) => updateDraftArray('stakeholders', i, 'name', e.target.value)} />
                                            <input placeholder="Role" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={sh.role} onChange={(e) => updateDraftArray('stakeholders', i, 'role', e.target.value)} />
                                            <Trash2 size={20} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeDraftArrayItem('stakeholders', i)} />
                                        </>
                                    ) : (
                                        <span>• {sh.name} - {sh.role}</span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* RISKS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3><AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px' }} />Risks</h3>
                            {isEditing && <button onClick={() => addDraftArrayItem('risks', { description: '', impact: '', mitigation: '' })} className="btn-icon" style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={20} /></button>}
                        </div>

                        {(isEditing ? editDraft.risks : brd.risks)?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {(isEditing ? editDraft.risks : brd.risks).map((risk, i) => (
                                    <div key={i} className="list-item" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                                <input placeholder="Risk Description" style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={risk.description} onChange={(e) => updateDraftArray('risks', i, 'description', e.target.value)} />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input placeholder="Impact (LOW, MED, HIGH)" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={risk.impact} onChange={(e) => updateDraftArray('risks', i, 'impact', e.target.value)} />
                                                    <input placeholder="Mitigation Strategy" style={{ flex: 2, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={risk.mitigation} onChange={(e) => updateDraftArray('risks', i, 'mitigation', e.target.value)} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ flex: 1 }}>
                                                <strong>{risk.description}</strong><br />
                                                <span style={{ fontSize: '0.9em', color: '#64748b' }}>Impact: {risk.impact} | Mitigation: {risk.mitigation}</span>
                                            </div>
                                        )}
                                        {isEditing && <Trash2 size={20} color="#ef4444" style={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => removeDraftArrayItem('risks', i)} />}
                                    </div>
                                ))}
                            </div>
                        ) : <p>No risks identified.</p>}

                        {/* TIMELINE */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3><Calendar size={18} style={{ display: 'inline', marginRight: '8px' }} />Timeline</h3>
                            {isEditing && <button onClick={() => addDraftArrayItem('timelines', { milestone: '', expectedDate: '', description: '' })} className="btn-icon" style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={20} /></button>}
                        </div>
                        {(isEditing ? editDraft.timelines : brd.timelines)?.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {(isEditing ? editDraft.timelines : brd.timelines).map((t, i) => (
                                    <li key={i} className="list-item" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                        {isEditing ? (
                                            <>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                                    <input placeholder="Milestone Name" style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={t.milestone} onChange={(e) => updateDraftArray('timelines', i, 'milestone', e.target.value)} />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input placeholder="Expected Date" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={t.expectedDate} onChange={(e) => updateDraftArray('timelines', i, 'expectedDate', e.target.value)} />
                                                        <input placeholder="Description" style={{ flex: 2, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={t.description} onChange={(e) => updateDraftArray('timelines', i, 'description', e.target.value)} />
                                                    </div>
                                                </div>
                                                <Trash2 size={20} color="#ef4444" style={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => removeDraftArrayItem('timelines', i)} />
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontWeight: 'bold', minWidth: '100px' }}>{t.milestone}</span>
                                                <span style={{ color: '#6b7280' }}>{t.expectedDate}</span>
                                                <span>{t.description}</span>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : <p>No timeline milestones identified.</p>}

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button className="btn" style={{ background: 'gray' }} onClick={() => { setBrd(null); setIsEditing(false); }}>
                                Start New Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
