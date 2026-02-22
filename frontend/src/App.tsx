import React, { useState } from 'react';
import { uploadFile, uploadText, updateBrd, getRtm, BRD, RTMEntry, getPdfUrl, getDocxUrl } from './api/api';
import {
    Upload, Download, Wand2, AlertTriangle, Calendar, Edit, Save,
    Trash2, Plus, Network, FileTerminal, FileText, CheckCircle2,
    Users, PlusCircle
} from 'lucide-react';

function App() {
    const [brd, setBrd] = useState<BRD | null>(null);
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editDraft, setEditDraft] = useState<BRD | null>(null);
    const [rtmEntries, setRtmEntries] = useState<RTMEntry[]>([]);
    const [saving, setSaving] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            try {
                const result = await uploadFile(e.target.files[0]);
                setBrd(result);
                setEditDraft(result);
                const rtmResult = await getRtm(result.id);
                setRtmEntries(rtmResult);
                setIsEditing(true);
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
            const rtmResult = await getRtm(result.id);
            setRtmEntries(rtmResult);
            setIsEditing(true);
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
            const rtmResult = await getRtm(editDraft.id);
            setRtmEntries(rtmResult);
            setIsEditing(false);
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
        <div className="app-container">
            <header className="topbar">
                <div className="topbar-brand">
                    <FileTerminal size={24} color="var(--color-accent)" />
                    BRDify
                </div>
                {brd && (
                    <div className="text-sm font-medium text-muted">
                        Enterprise Requirements Engine
                    </div>
                )}
            </header>

            <main className="main-content">
                {!brd && !loading && (
                    <section className="hero-section fade-in">
                        <h1>Transform chaos into structured requirements.</h1>
                        <p>Upload meeting transcripts, raw emails, or project briefs to instantly generate premium Business Requirement Documents.</p>

                        <div className="upload-box" onClick={() => document.getElementById('file-upload')?.click()}>
                            <Upload size={48} color="var(--color-text-light)" />
                            <div>
                                <h3 className="mb-2">Upload Source Document</h3>
                                <p className="text-sm text-muted m-0">Supports .txt and .pdf formats up to 10MB</p>
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                hidden
                                onChange={handleFileUpload}
                                accept=".txt,.pdf"
                            />
                        </div>

                        <div className="divider">OR PASTE TEXT DIRECTLY</div>

                        <div className="flex-col gap-4">
                            <textarea
                                className="textarea"
                                placeholder="Paste your raw project discussion, email thread, or feature requests here..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted">Powered by deep LLM extraction</span>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleTextUpload}
                                    disabled={!textInput.trim()}
                                >
                                    <Wand2 size={16} /> Generate BRD
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {loading && (
                    <div className="loading-overlay fade-in">
                        <Wand2 size={48} className="spinner" />
                        <h2>Analyzing Input Data</h2>
                        <p className="text-muted mt-4">Extracting structured requirements, decisions, and risks...</p>
                    </div>
                )}

                {brd && editDraft && (
                    <article className="brd-editor fade-in">
                        {/* Header Document Actions */}
                        <div className="doc-header">
                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        className="doc-title-input"
                                        value={editDraft.title}
                                        onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                                        placeholder="Document Title"
                                    />
                                ) : (
                                    <h1 style={{ marginTop: 0, marginBottom: 0 }}>{brd.title}</h1>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {isEditing ? (
                                    <button onClick={handleSaveBrd} className="btn btn-primary" disabled={saving}>
                                        {saving ? <Wand2 className="spinner" style={{ margin: 0 }} size={16} /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Document'}
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => { setEditDraft(brd); setIsEditing(true); }} className="btn btn-secondary">
                                            <Edit size={16} /> Edit
                                        </button>
                                        <a href={getPdfUrl(brd.id)} target="_blank" rel="noreferrer" className="btn btn-secondary">
                                            <FileText size={16} /> Download PDF
                                        </a>
                                        <a href={getDocxUrl(brd.id)} target="_blank" rel="noreferrer" className="btn btn-secondary">
                                            <Download size={16} /> Download DOCX
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Requirements */}
                        <section className="card">
                            <div className="card-header">
                                <h3><CheckCircle2 size={20} color="var(--color-accent)" /> Requirements</h3>
                                {isEditing && (
                                    <button onClick={() => addDraftArrayItem('requirements', { description: '' })} className="btn btn-secondary text-sm">
                                        <Plus size={16} /> Add Requirement
                                    </button>
                                )}
                            </div>

                            <div className="item-list">
                                {(isEditing ? editDraft.requirements : brd.requirements).length > 0 ? (
                                    (isEditing ? editDraft.requirements : brd.requirements).map((req, i) => (
                                        <div key={i} className="list-row">
                                            <div className="list-row-content">
                                                {isEditing ? (
                                                    <input
                                                        className="input"
                                                        value={req.description}
                                                        placeholder="Describe the functional or non-functional requirement..."
                                                        onChange={(e) => updateDraftArray('requirements', i, 'description', e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="font-medium">{req.description}</span>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <button className="btn-icon-only btn-icon-danger" onClick={() => removeDraftArrayItem('requirements', i)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <CheckCircle2 size={32} />
                                        No requirements identified.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Decisions */}
                        <section className="card">
                            <div className="card-header">
                                <h3><Wand2 size={20} color="var(--color-accent)" /> Decisions</h3>
                                {isEditing && (
                                    <button onClick={() => addDraftArrayItem('decisions', { description: '' })} className="btn btn-secondary text-sm">
                                        <Plus size={16} /> Add Decision
                                    </button>
                                )}
                            </div>

                            <div className="item-list">
                                {(isEditing ? editDraft.decisions : brd.decisions).length > 0 ? (
                                    (isEditing ? editDraft.decisions : brd.decisions).map((dec, i) => (
                                        <div key={i} className="list-row">
                                            <div className="list-row-content">
                                                {isEditing ? (
                                                    <input
                                                        className="input"
                                                        value={dec.description}
                                                        placeholder="Document a key decision made during discovery..."
                                                        onChange={(e) => updateDraftArray('decisions', i, 'description', e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="font-medium">{dec.description}</span>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <button className="btn-icon-only btn-icon-danger" onClick={() => removeDraftArrayItem('decisions', i)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <Wand2 size={32} />
                                        No key decisions identified.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Stakeholders */}
                        <section className="card">
                            <div className="card-header">
                                <h3><Users size={20} color="var(--color-accent)" /> Stakeholders</h3>
                                {isEditing && (
                                    <button onClick={() => addDraftArrayItem('stakeholders', { name: '', role: '' })} className="btn btn-secondary text-sm">
                                        <Plus size={16} /> Add Stakeholder
                                    </button>
                                )}
                            </div>

                            <div className="grid-2">
                                {(isEditing ? editDraft.stakeholders : brd.stakeholders).length > 0 ? (
                                    (isEditing ? editDraft.stakeholders : brd.stakeholders).map((sh, i) => (
                                        <div key={i} className="list-row">
                                            <div className="list-row-content">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            className="input py-2"
                                                            placeholder="Stakeholder Name"
                                                            value={sh.name}
                                                            onChange={(e) => updateDraftArray('stakeholders', i, 'name', e.target.value)}
                                                        />
                                                        <input
                                                            className="input py-2"
                                                            placeholder="Project Role"
                                                            value={sh.role}
                                                            onChange={(e) => updateDraftArray('stakeholders', i, 'role', e.target.value)}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="font-semibold">{sh.name}</span>
                                                        <span className="text-sm text-muted">{sh.role}</span>
                                                    </>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <button className="btn-icon-only btn-icon-danger" onClick={() => removeDraftArrayItem('stakeholders', i)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                        <Users size={32} />
                                        No stakeholders identified.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Risks */}
                        <section className="card">
                            <div className="card-header">
                                <h3><AlertTriangle size={20} color="var(--color-danger)" /> Risks & Mitigations</h3>
                                {isEditing && (
                                    <button onClick={() => addDraftArrayItem('risks', { description: '', impact: '', mitigation: '' })} className="btn btn-secondary text-sm">
                                        <Plus size={16} /> Add Risk
                                    </button>
                                )}
                            </div>

                            <div className="item-list">
                                {(isEditing ? editDraft.risks : brd.risks)?.length > 0 ? (
                                    (isEditing ? editDraft.risks : brd.risks).map((risk, i) => (
                                        <div key={i} className="list-row" style={{ borderLeft: "3px solid var(--color-danger)" }}>
                                            <div className="list-row-content">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            className="input"
                                                            placeholder="Risk Description"
                                                            value={risk.description}
                                                            onChange={(e) => updateDraftArray('risks', i, 'description', e.target.value)}
                                                        />
                                                        <div className="input-group mt-2">
                                                            <div className="input-stacked" style={{ flex: '0 0 200px' }}>
                                                                <input
                                                                    className="input"
                                                                    placeholder="Impact (e.g., High, Med)"
                                                                    value={risk.impact}
                                                                    onChange={(e) => updateDraftArray('risks', i, 'impact', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="input-stacked">
                                                                <input
                                                                    className="input"
                                                                    placeholder="Mitigation Strategy"
                                                                    value={risk.mitigation}
                                                                    onChange={(e) => updateDraftArray('risks', i, 'mitigation', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-medium text-main">{risk.description}</span>
                                                            {risk.impact && (
                                                                <span className="badge" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-bg)' }}>
                                                                    Impact: {risk.impact}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {risk.mitigation && (
                                                            <div className="text-sm text-muted mt-2">
                                                                <strong>Mitigation:</strong> {risk.mitigation}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <button className="btn-icon-only btn-icon-danger" onClick={() => removeDraftArrayItem('risks', i)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <AlertTriangle size={32} />
                                        No specific risks identified.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Timeline */}
                        <section className="card">
                            <div className="card-header">
                                <h3><Calendar size={20} color="var(--color-accent)" /> Timeline & Milestones</h3>
                                {isEditing && (
                                    <button onClick={() => addDraftArrayItem('timelines', { milestone: '', expectedDate: '', description: '' })} className="btn btn-secondary text-sm">
                                        <Plus size={16} /> Add Milestone
                                    </button>
                                )}
                            </div>

                            <div className="item-list">
                                {(isEditing ? editDraft.timelines : brd.timelines)?.length > 0 ? (
                                    (isEditing ? editDraft.timelines : brd.timelines).map((t, i) => (
                                        <div key={i} className="list-row">
                                            <div className="list-row-content">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            className="input font-semibold"
                                                            placeholder="Milestone Title"
                                                            value={t.milestone}
                                                            onChange={(e) => updateDraftArray('timelines', i, 'milestone', e.target.value)}
                                                        />
                                                        <div className="input-group mt-2">
                                                            <div className="input-stacked" style={{ flex: '0 0 200px' }}>
                                                                <input
                                                                    className="input"
                                                                    placeholder="Expected Date (e.g. Q3 2026)"
                                                                    value={t.expectedDate}
                                                                    onChange={(e) => updateDraftArray('timelines', i, 'expectedDate', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="input-stacked">
                                                                <input
                                                                    className="input"
                                                                    placeholder="Milestone Description"
                                                                    value={t.description}
                                                                    onChange={(e) => updateDraftArray('timelines', i, 'description', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex gap-4 items-center">
                                                            <span className="font-semibold">{t.milestone}</span>
                                                            {t.expectedDate && (
                                                                <span className="badge">{t.expectedDate}</span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted">
                                                            {t.description}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <button className="btn-icon-only btn-icon-danger" onClick={() => removeDraftArrayItem('timelines', i)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <Calendar size={32} />
                                        No timeline milestones identified.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* RTM Traceability Matrix */}
                        {rtmEntries.length > 0 && !isEditing && (
                            <section className="card">
                                <div className="card-header border-b-0 pb-0">
                                    <h3><Network size={20} color="var(--color-primary)" /> Requirement Traceability Matrix</h3>
                                </div>
                                <div className="text-sm text-muted mb-6">Lineage linking extracted AI properties to original text quotes.</div>

                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '25%' }}>Requirement</th>
                                                <th style={{ width: '30%' }}>Source Quote</th>
                                                <th>Linked Decision</th>
                                                <th>Linked Risk</th>
                                                <th>Timeline</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rtmEntries.map((rtm) => (
                                                <tr key={rtm.id}>
                                                    <td className="font-medium">{rtm.requirement?.description || '-'}</td>
                                                    <td className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.8125rem' }}>"{rtm.sourceChunk}"</td>
                                                    <td>{rtm.decision?.description || '-'}</td>
                                                    <td style={{ color: rtm.risk ? 'var(--color-danger)' : 'inherit' }}>{rtm.risk?.description || '-'}</td>
                                                    <td>{rtm.timeline?.milestone || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        <div className="flex justify-center mt-8 pt-8 border-t border-slate-200">
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setBrd(null); setIsEditing(false); setTextInput(''); }}
                            >
                                <PlusCircle size={16} /> Start New Document
                            </button>
                        </div>

                    </article>
                )}
            </main>
        </div>
    );
}

export default App;
