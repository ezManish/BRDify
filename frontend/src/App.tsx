import React, { useState, useRef } from 'react';
import { uploadFile, uploadText, updateBrd, getRtm, BRD, RTMEntry, getPdfUrl, getDocxUrl } from './api/api';
import {
    FileText,
    UploadCloud,
    Loader2,
    Save,
    XCircle,
    Download,
    Settings,
    LayoutDashboard,
    ListChecks,
    Users,
    AlertTriangle,
    Clock,
    Edit3,
    PlusCircle,
    Network
} from 'lucide-react';

type TabKey = 'summary' | 'requirements' | 'decisions' | 'stakeholders' | 'risks' | 'timeline' | 'traceability';

function App() {
    const [brd, setBrd] = useState<BRD | null>(null);
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editDraft, setEditDraft] = useState<BRD | null>(null);
    const [rtmEntries, setRtmEntries] = useState<RTMEntry[]>([]);
    const [saving, setSaving] = useState(false);

    // New Dashboard State
    const [activeTab, setActiveTab] = useState<TabKey>('summary');
    const [heroTab, setHeroTab] = useState<'upload' | 'paste'>('upload');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);

        try {
            const data = await uploadFile(file);
            setBrd(data);
            setActiveTab('summary');
            if (data) {
                const rtm = await getRtm(data.id);
                setRtmEntries(rtm);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to process the document. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleTextUpload = async () => {
        if (!textInput.trim()) return;

        setLoading(true);
        try {
            const data = await uploadText(textInput);
            setBrd(data);
            setActiveTab('summary');
            if (data) {
                const rtm = await getRtm(data.id);
                setRtmEntries(rtm);
            }
        } catch (error) {
            console.error('Error processing text:', error);
            alert('Failed to process text. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBrd = async () => {
        if (!editDraft) return;
        setSaving(true);
        try {
            const data = await updateBrd(editDraft.id, editDraft);
            setBrd(data);
            setIsEditing(false);
            setEditDraft(null);

            const rtm = await getRtm(data.id);
            setRtmEntries(rtm);

        } catch (error) {
            console.error('Error saving BRD:', error);
            alert('Failed to save BRD.');
        } finally {
            setSaving(false);
        }
    };

    // --- Array Helpers ---
    const updateDraftArray = (field: keyof BRD, index: number, key: string, value: string) => {
        if (!editDraft) return;
        const newArr = [...(editDraft[field] as any[])];
        newArr[index] = { ...newArr[index], [key]: value };
        setEditDraft({ ...editDraft, [field]: newArr });
    };

    const removeDraftArrayItem = (field: keyof BRD, index: number) => {
        if (!editDraft) return;
        const newArr = [...(editDraft[field] as any[])];
        newArr.splice(index, 1);
        setEditDraft({ ...editDraft, [field]: newArr });
    };

    const addDraftArrayItem = (field: keyof BRD, emptyObj: any) => {
        if (!editDraft) return;
        setEditDraft({ ...editDraft, [field]: [...(editDraft[field] as any[]), emptyObj] });
    };

    const startEditing = () => {
        setEditDraft(JSON.parse(JSON.stringify(brd))); // Deep copy
        setIsEditing(true);
    };

    const activeBrd = isEditing ? editDraft : brd;

    // ==========================================
    // UI COMPONENTS
    // ==========================================

    if (loading) {
        return (
            <div className="dashboard-layout">
                {/* Skeleton Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <div className="skeleton" style={{ width: '120px', height: '24px' }}></div>
                    </div>
                    <div className="sidebar-nav mt-8">
                        <div className="skeleton mb-4" style={{ width: '80px', height: '12px' }}></div>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton mb-2" style={{ width: '100%', height: '36px', borderRadius: 'var(--radius-sm)' }}></div>
                        ))}
                    </div>
                </aside>
                {/* Skeleton Main Stage */}
                <main className="main-stage">
                    <header className="stage-header">
                        <div className="skeleton" style={{ width: '200px', height: '24px' }}></div>
                        <div className="skeleton" style={{ width: '100px', height: '36px' }}></div>
                    </header>
                    <div className="stage-content">
                        <div className="content-container">
                            <div className="section-panel">
                                <div className="panel-header">
                                    <div className="skeleton mb-2" style={{ width: '250px', height: '32px' }}></div>
                                    <div className="skeleton" style={{ width: '400px', height: '16px' }}></div>
                                </div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="item-card flex-col gap-4">
                                        <div className="skeleton" style={{ width: '30%', height: '16px' }}></div>
                                        <div className="skeleton" style={{ width: '100%', height: '60px' }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!activeBrd) {
        return (
            <div className="full-hero">
                <div className="hero-content fade-in">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <FileText size={40} color="var(--color-accent)" />
                        <h1 style={{ marginBottom: 0 }}>BRDify</h1>
                    </div>
                    <p className="hero-subtitle">
                        The intelligent engine for converting transcripts and scattered notes into structured Business Requirements.
                    </p>

                    <div className="hero-card">
                        <div className="hero-tabs">
                            <button
                                className={`hero-tab ${heroTab === 'upload' ? 'active' : ''}`}
                                onClick={() => setHeroTab('upload')}
                            >
                                <UploadCloud size={16} /> Upload Document
                            </button>
                            <button
                                className={`hero-tab ${heroTab === 'paste' ? 'active' : ''}`}
                                onClick={() => setHeroTab('paste')}
                            >
                                <FileText size={16} /> Paste Text
                            </button>
                        </div>

                        <div className="hero-card-content">
                            {heroTab === 'upload' ? (
                                <div
                                    className="upload-zone clean"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="icon-ring">
                                        <UploadCloud size={32} color="var(--accent-color)" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1" style={{ fontSize: '1.25rem' }}>Select a file to upload</h3>
                                        <p className="text-sm text-muted">Supports PDF, DOCX, or TXT up to 10MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                        accept=".txt,.pdf,.docx"
                                    />
                                </div>
                            ) : (
                                <div className="paste-zone fade-in">
                                    <textarea
                                        className="hero-textarea clean"
                                        placeholder="Paste meeting notes, user interviews, or raw requirements here..."
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                    />
                                    <div className="flex justify-end mt-4">
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleTextUpload}
                                            disabled={!textInput.trim()}
                                            style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}
                                        >
                                            Generate BRD
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Tab Renderers ---

    const renderSummaryTab = () => (
        <div className="section-panel fade-in">
            <div className="panel-header">
                <h2><FileText size={24} color="var(--color-accent)" /> Document Overview</h2>
                <p className="text-muted">High-level summary and title of the project.</p>
            </div>

            <div className="item-card">
                <div className="item-content">
                    <label className="text-xs">Project Title</label>
                    {isEditing ? (
                        <input
                            className="input"
                            style={{ fontSize: '1.5rem', fontWeight: 600, padding: '1rem', width: '100%' }}
                            value={activeBrd.title}
                            onChange={(e) => setEditDraft({ ...editDraft!, title: e.target.value })}
                        />
                    ) : (
                        <h1 style={{ fontSize: '2rem' }}>{activeBrd.title}</h1>
                    )}
                </div>
            </div>

            <div className="item-card mt-4">
                <div className="item-content">
                    <label className="text-xs">Executive Summary</label>
                    {isEditing ? (
                        <textarea
                            className="textarea mt-2"
                            style={{ minHeight: '300px' }}
                            value={activeBrd.summary}
                            onChange={(e) => setEditDraft({ ...editDraft!, summary: e.target.value })}
                        />
                    ) : (
                        <p className="mt-2" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-muted)' }}>{activeBrd.summary}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderRequirementsTab = () => (
        <div className="section-panel fade-in">
            <div className="panel-header flex justify-between items-center">
                <div>
                    <h2><ListChecks size={24} color="var(--color-accent)" /> Requirements</h2>
                    <p className="text-muted">Extracted functional and non-functional requirements.</p>
                </div>
                {isEditing && (
                    <button className="btn btn-secondary" onClick={() => addDraftArrayItem('requirements', { description: '', sourceQuote: '' })}>
                        <PlusCircle size={16} /> Add Requirement
                    </button>
                )}
            </div>

            {(!activeBrd.requirements || activeBrd.requirements.length === 0) ? (
                <div className="empty-state">No requirements extracted.</div>
            ) : (
                <div className="flex-col gap-4">
                    {activeBrd.requirements.map((req, idx) => (
                        <div key={idx} className="item-card">
                            <div className="item-content w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="badge">REQ-{idx + 1}</span>
                                    {isEditing && (
                                        <button className="btn-icon-only btn-icon-danger" onClick={() => removeDraftArrayItem('requirements', idx)} title="Remove Requirement">
                                            <XCircle size={16} />
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="flex-col gap-4">
                                        <div className="input-stacked">
                                            <label className="text-xs">Description</label>
                                            <textarea className="textarea" style={{ minHeight: '80px' }} value={req.description} onChange={(e) => updateDraftArray('requirements', idx, 'description', e.target.value)} />
                                        </div>
                                        <div className="input-stacked">
                                            <label className="text-xs">Source Quote (Verbatim)</label>
                                            <textarea className="textarea" style={{ minHeight: '60px' }} value={req.sourceQuote} onChange={(e) => updateDraftArray('requirements', idx, 'sourceQuote', e.target.value)} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p style={{ fontWeight: 500, marginBottom: '1rem' }}>{req.description}</p>
                                        <div style={{ padding: '0.75rem', background: 'var(--color-bg)', borderLeft: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                            <p className="text-sm text-muted" style={{ fontStyle: 'italic' }}>"{req.sourceQuote}"</p>
                                        </div>
                                    </>
                                )}

                                {/* Links pill tags (view mode only) - would ideally come from backend logic if supported directly on BRD object */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderDecisionsTab = () => (
        <div className="section-panel fade-in">
            <div className="panel-header flex justify-between items-center">
                <div>
                    <h2><LayoutDashboard size={24} color="var(--color-accent)" /> Key Decisions</h2>
                    <p className="text-muted">Architectural or business decisions extracted.</p>
                </div>
                {isEditing && (
                    <button className="btn btn-secondary" onClick={() => {
                        if (editDraft) setEditDraft({ ...editDraft, decisions: [...editDraft.decisions, { description: '' }] });
                    }}>
                        <PlusCircle size={16} /> Add Decision
                    </button>
                )}
            </div>

            {(!activeBrd.decisions || activeBrd.decisions.length === 0) ? (
                <div className="empty-state">No items found.</div>
            ) : (
                <div className="flex-col gap-3">
                    {activeBrd.decisions.map((item, idx) => (
                        <div key={idx} className="item-card" style={{ padding: '1rem', alignItems: 'center' }}>
                            <div className="item-content flex" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', width: '100%' }}>
                                <span className="text-xs text-muted" style={{ minWidth: '24px' }}>{(idx + 1).toString().padStart(2, '0')}</span>
                                {isEditing ? (
                                    <input className="input" value={item.description} onChange={(e) => updateDraftArray('decisions', idx, 'description', e.target.value)} />
                                ) : (
                                    <span style={{ flex: 1 }}>{item.description}</span>
                                )}
                            </div>
                            {isEditing && (
                                <button className="btn-icon-only btn-icon-danger flex-shrink-0" onClick={() => removeDraftArrayItem('decisions', idx)}><XCircle size={16} /></button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStakeholdersTab = () => (
        <div className="section-panel fade-in">
            <div className="panel-header flex justify-between items-center">
                <div>
                    <h2><Users size={24} color="var(--color-accent)" /> Stakeholders</h2>
                    <p className="text-muted">Identified parties and roles involved.</p>
                </div>
                {isEditing && (
                    <button className="btn btn-secondary" onClick={() => addDraftArrayItem('stakeholders', { name: '', role: '' })}>
                        <PlusCircle size={16} /> Add Stakeholder
                    </button>
                )}
            </div>

            {(!activeBrd.stakeholders || activeBrd.stakeholders.length === 0) ? (
                <div className="empty-state">No items found.</div>
            ) : (
                <div className="grid-2 gap-4">
                    {activeBrd.stakeholders.map((person, idx) => (
                        <div key={idx} className="item-card flex justify-between" style={{ padding: '1rem', alignItems: 'center' }}>
                            {isEditing ? (
                                <div className="flex-col gap-2 w-full mr-4">
                                    <input className="input" placeholder="Name" value={person.name} onChange={(e) => updateDraftArray('stakeholders', idx, 'name', e.target.value)} />
                                    <input className="input" placeholder="Role" value={person.role} onChange={(e) => updateDraftArray('stakeholders', idx, 'role', e.target.value)} />
                                </div>
                            ) : (
                                <div className="flex-col">
                                    <span className="font-semibold">{person.name}</span>
                                    <span className="text-sm text-muted mt-1">{person.role}</span>
                                </div>
                            )}

                            {isEditing && (
                                <button className="btn-icon-only btn-icon-danger flex-shrink-0" onClick={() => removeDraftArrayItem('stakeholders', idx)}><XCircle size={16} /></button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );


    const renderRisksTab = () => (
        <div className="section-panel fade-in">
            <div className="panel-header flex justify-between items-center">
                <div>
                    <h2><AlertTriangle size={24} color="var(--color-danger)" /> Risk Assessment</h2>
                    <p className="text-muted">Identified risks and mitigation strategies.</p>
                </div>
                {isEditing && (
                    <button className="btn btn-secondary" onClick={() => addDraftArrayItem('risks', { description: '', probability: 'Medium', impact: 'Medium', mitigation: '' })}>
                        <PlusCircle size={16} /> Add Risk
                    </button>
                )}
            </div>

            {(!activeBrd.risks || activeBrd.risks.length === 0) ? (
                <div className="empty-state">No risks identified.</div>
            ) : (
                <div className="flex-col gap-4">
                    {activeBrd.risks.map((risk, idx) => (
                        <div key={idx} className="item-card" style={{ borderLeft: "3px solid var(--color-danger)" }}>
                            <div className="item-content w-full">
                                <div className="flex gap-2 justify-end mb-4">
                                    {isEditing ? (
                                        <>
                                            <input className="input text-sm" style={{ width: '100px', padding: '0.25rem 0.5rem' }} value={risk.probability || ''} placeholder="Prob" onChange={(e) => updateDraftArray('risks', idx, 'probability', e.target.value)} />
                                            <input className="input text-sm" style={{ width: '100px', padding: '0.25rem 0.5rem' }} value={risk.impact || ''} placeholder="Impact" onChange={(e) => updateDraftArray('risks', idx, 'impact', e.target.value)} />
                                        </>
                                    ) : (
                                        <>
                                            {risk.probability && <span className="badge">Prob: {risk.probability}</span>}
                                            {risk.impact && <span className="badge" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-bg)' }}>Imp: {risk.impact}</span>}
                                        </>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className="flex-col gap-4">
                                        <div className="input-stacked">
                                            <label className="text-xs">Risk Description</label>
                                            <textarea className="textarea" style={{ minHeight: '60px' }} value={risk.description} onChange={(e) => updateDraftArray('risks', idx, 'description', e.target.value)} />
                                        </div>
                                        <div className="input-stacked">
                                            <label className="text-xs">Mitigation Strategy</label>
                                            <textarea className="textarea" style={{ minHeight: '60px' }} value={risk.mitigation} onChange={(e) => updateDraftArray('risks', idx, 'mitigation', e.target.value)} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p style={{ fontWeight: 500 }}>{risk.description}</p>
                                        <div className="mt-4 text-sm text-secondary">
                                            <strong style={{ color: 'var(--color-text-main)' }}>Mitigation: </strong> {risk.mitigation}
                                        </div>
                                    </>
                                )}
                            </div>
                            {isEditing && (
                                <button className="btn-icon-only btn-icon-danger" onClick={() => removeDraftArrayItem('risks', idx)} style={{ height: 'fit-content', marginLeft: '1rem' }}><XCircle size={16} /></button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderTimelineTab = () => (
        <div className="section-panel fade-in">
            <div className="panel-header flex justify-between items-center">
                <div>
                    <h2><Clock size={24} color="var(--color-accent)" /> Project Timeline</h2>
                    <p className="text-muted">Expected milestones and delivery dates.</p>
                </div>
                {isEditing && (
                    <button className="btn btn-secondary" onClick={() => addDraftArrayItem('timelines', { milestone: '', expectedDate: '', description: '' })}>
                        <PlusCircle size={16} /> Add Milestone
                    </button>
                )}
            </div>

            {(!activeBrd.timelines || activeBrd.timelines.length === 0) ? (
                <div className="empty-state">No timeline established.</div>
            ) : (
                <div className="flex-col gap-4">
                    {activeBrd.timelines.map((item, idx) => (
                        <div key={idx} className="item-card">
                            <div className="item-content flex items-start" style={{ flexDirection: 'row', gap: '2rem', width: '100%' }}>
                                <div style={{ width: '25%' }}>
                                    {isEditing ? (
                                        <input className="input" placeholder="Date/Phase" value={item.expectedDate} onChange={(e) => updateDraftArray('timelines', idx, 'expectedDate', e.target.value)} />
                                    ) : (
                                        <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>{item.expectedDate}</span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    {isEditing ? (
                                        <div className="flex-col gap-2">
                                            <input className="input font-semibold" placeholder="Milestone Name" value={item.milestone} onChange={(e) => updateDraftArray('timelines', idx, 'milestone', e.target.value)} />
                                            <textarea className="textarea" placeholder="Description" value={item.description} onChange={(e) => updateDraftArray('timelines', idx, 'description', e.target.value)} />
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="mb-2">{item.milestone}</h4>
                                            <p className="text-sm text-muted">{item.description}</p>
                                        </>
                                    )}
                                </div>
                                {isEditing && (
                                    <button className="btn-icon-only btn-icon-danger ml-4" onClick={() => removeDraftArrayItem('timelines', idx)}><XCircle size={16} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderRtmTab = () => (
        <div className="section-panel fade-in">
            <div className="panel-header">
                <h2><Network size={24} color="var(--color-accent)" /> Traceability Matrix</h2>
                <p className="text-muted">Mapping requirements to decisions, risks, and timeline elements.</p>
            </div>

            {rtmEntries.length === 0 ? (
                <div className="empty-state">Matrix is empty. No specific requirements available to trace.</div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Requirement</th>
                                <th style={{ width: '30%' }}>Source Text Segment</th>
                                <th>Linked Decision</th>
                                <th>Linked Risk</th>
                                <th>Milestone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rtmEntries.map((entry, idx) => (
                                <tr key={idx}>
                                    <td className="font-semibold">{entry.requirement?.description || '-'}</td>
                                    <td>
                                        <div className="text-sm text-muted" style={{ fontStyle: 'italic', textTransform: 'none' }}>
                                            "{entry.sourceChunk.length > 100 ? entry.sourceChunk.substring(0, 100) + '...' : entry.sourceChunk}"
                                        </div>
                                    </td>
                                    <td>{entry.decision?.description ? <span className="text-sm">{entry.decision.description}</span> : <span className="text-xs text-muted">-</span>}</td>
                                    <td>{entry.risk?.description ? <span className="text-sm" style={{ color: 'var(--color-danger)' }}>{entry.risk.description}</span> : <span className="text-xs text-muted">-</span>}</td>
                                    <td>{entry.timeline?.milestone ? <span className="text-sm">{entry.timeline.milestone}</span> : <span className="text-xs text-muted">-</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'summary': return renderSummaryTab();
            case 'requirements': return renderRequirementsTab();
            case 'decisions': return renderDecisionsTab();
            case 'stakeholders': return renderStakeholdersTab();
            case 'risks': return renderRisksTab();
            case 'timeline': return renderTimelineTab();
            case 'traceability': return renderRtmTab();
            default: return null;
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="brand flex items-center gap-2" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                        <FileText size={24} color="var(--color-accent)" />
                        BRDify
                    </div>
                </div>

                <nav className="sidebar-nav mt-8">
                    <div className="text-xs mb-2 mt-4 ml-3" style={{ opacity: 0.5, fontWeight: 600, letterSpacing: '0.05em' }}>DOCUMENT STRUCTURE</div>
                    <div className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
                        <LayoutDashboard size={18} /> Summary Overview
                    </div>
                    <div className={`nav-item ${activeTab === 'requirements' ? 'active' : ''}`} onClick={() => setActiveTab('requirements')}>
                        <ListChecks size={18} /> Requirements <span className="badge ml-auto" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)' }}>{activeBrd.requirements?.length || 0}</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'decisions' ? 'active' : ''}`} onClick={() => setActiveTab('decisions')}>
                        <Settings size={18} /> Decisions
                    </div>
                    <div className={`nav-item ${activeTab === 'stakeholders' ? 'active' : ''}`} onClick={() => setActiveTab('stakeholders')}>
                        <Users size={18} /> Stakeholders
                    </div>
                    <div className={`nav-item ${activeTab === 'risks' ? 'active' : ''}`} onClick={() => setActiveTab('risks')}>
                        <AlertTriangle size={18} /> Risks
                    </div>
                    <div className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
                        <Clock size={18} /> Timeline
                    </div>

                    <div className="text-xs mb-2 mt-8 ml-3" style={{ opacity: 0.5, fontWeight: 600, letterSpacing: '0.05em' }}>ANALYSIS</div>
                    <div className={`nav-item ${activeTab === 'traceability' ? 'active' : ''}`} onClick={() => setActiveTab('traceability')}>
                        <Network size={18} /> Traceability Matrix
                    </div>

                    <div style={{ marginTop: 'auto', paddingBottom: '1rem' }}>
                        <button
                            className="btn btn-secondary w-full flex items-center justify-center gap-2"
                            onClick={() => { setBrd(null); setIsEditing(false); setTextInput(''); }}
                        >
                            <PlusCircle size={16} /> New Document
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Stage Area */}
            <main className="main-stage">
                <header className="stage-header">
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <span className="badge" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-border-focus)' }}>Editing Draft</span>
                        ) : (
                            <span className="badge">Read-Only</span>
                        )}
                        <h3 className="m-0 text-lg font-medium" style={{ color: 'var(--color-text-main)' }}>
                            {activeBrd.title.substring(0, 60)}{activeBrd.title.length > 60 ? '...' : ''}
                        </h3>
                    </div>

                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button className="btn btn-secondary" onClick={() => { setIsEditing(false); setEditDraft(null); }} disabled={saving}>
                                    <XCircle size={16} /> Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleSaveBrd} disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-secondary" onClick={startEditing}>
                                    <Edit3 size={16} /> Edit
                                </button>
                                {brd && (
                                    <>
                                        <a href={getPdfUrl(brd.id)} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                                            <Download size={16} /> PDF
                                        </a>
                                        <a href={getDocxUrl(brd.id)} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                                            <Download size={16} /> DOCX
                                        </a>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </header>

                <div className="stage-content">
                    <div className="content-container">
                        {renderActiveTab()}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
