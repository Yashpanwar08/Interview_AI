import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../../common/Navbar'
import { useInterview } from '../hooks/useInterview'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/dashboard.scss'

const Dashboard = () => {
    const { user } = useAuth()
    const { reports, getReports, loading, getResumePdf, downloadingResumeId } = useInterview()
    const [ activeTab, setActiveTab ] = useState('strategies') // 'strategies' | 'resumes'
    const [ searchTerm, setSearchTerm ] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        getReports()
    }, [])

    const filteredReports = reports.filter(report => {
        return report.title?.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const avgScore = reports.length > 0
        ? Math.round(reports.reduce((acc, r) => acc + (r.matchScore || 0), 0) / reports.length)
        : 0

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-page__content">
                {/* ── Personal Profile Card ── */}
                <header className="profile-card">
                    <div className="profile-card__user">
                        <div className="avatar">
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="user-details">
                            <h2>{user?.username || 'Candidate Profile'}</h2>
                            <p>{user?.email || 'User Email'}</p>
                            <span className="badge-role">AI Strategy Member</span>
                        </div>
                    </div>

                    <div className="profile-card__stats">
                        <div className="stat-box">
                            <span className="stat-value">{reports.length}</span>
                            <span className="stat-label">Total Plans</span>
                        </div>

                        <div className="stat-box">
                            <span className="stat-value">{avgScore}%</span>
                            <span className="stat-label">Avg Match Score</span>
                        </div>

                        <Link to="/" className="new-plan-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Create Strategy
                        </Link>
                    </div>
                </header>

                {/* ── Dashboard Tabs ── */}
                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'strategies' ? 'tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('strategies')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        All Strategy Plans
                        <span className="tab-count">{reports.length}</span>
                    </button>

                    <button
                        className={`tab-btn ${activeTab === 'resumes' ? 'tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('resumes')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Tailored Resumes
                        <span className="tab-count">{reports.length}</span>
                    </button>
                </div>

                {/* ── Controls (Search Bar) ── */}
                <div className="dashboard-controls">
                    <div className="search-box">
                        <span className="search-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by job title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <span className="reports-count">
                        Showing {filteredReports.length} of {reports.length} items
                    </span>
                </div>

                {/* ── Content Area ── */}
                {loading && reports.length === 0 ? (
                    <div className="empty-state">
                        <h3>Loading dashboard items...</h3>
                    </div>
                ) : activeTab === 'strategies' ? (
                    filteredReports.length > 0 ? (
                        <div className="reports-grid">
                            {filteredReports.map((report) => {
                                const isDownloading = downloadingResumeId === report._id
                                const scoreClass =
                                    report.matchScore >= 80 ? 'score-pill--high' :
                                        report.matchScore >= 60 ? 'score-pill--mid' : 'score-pill--low'

                                return (
                                    <div key={report._id} className="report-card">
                                        <div className="report-card__header">
                                            <h3 className="report-title">{report.title || 'Untitled Strategy'}</h3>
                                            <span className="report-date">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="report-card__score">
                                            <span className={`score-pill ${scoreClass}`}>
                                                {report.matchScore}%
                                            </span>
                                            <span className="score-label">Match Score</span>
                                        </div>

                                        <div className="report-card__actions">
                                            <button
                                                className="action-btn action-btn--primary"
                                                onClick={() => navigate(`/interview/${report._id}`)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                                View Strategy
                                            </button>

                                            <button
                                                className="action-btn action-btn--download"
                                                onClick={() => getResumePdf(report._id)}
                                                disabled={isDownloading}
                                            >
                                                {isDownloading ? (
                                                    <>Generating PDF...</>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                            <polyline points="7 10 12 15 17 10" />
                                                            <line x1="12" y1="15" x2="12" y2="3" />
                                                        </svg>
                                                        Resume PDF
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                    <polyline points="2 17 12 22 22 17" />
                                    <polyline points="2 12 12 17 22 12" />
                                </svg>
                            </div>
                            <h3>No Strategy Plans Found</h3>
                            <p>
                                {searchTerm
                                    ? `No results matching "${searchTerm}".`
                                    : "You haven't generated any interview strategy reports yet."}
                            </p>
                            {!searchTerm && (
                                <Link to="/" className="new-plan-btn" style={{ marginTop: '0.5rem' }}>
                                    Create Your First Strategy
                                </Link>
                            )}
                        </div>
                    )
                ) : (
                    /* ── Tailored Resumes Tab ── */
                    filteredReports.length > 0 ? (
                        <div className="resumes-grid">
                            {filteredReports.map((report) => {
                                const isDownloading = downloadingResumeId === report._id
                                return (
                                    <div key={report._id} className="resume-card">
                                        <div className="resume-card__badge">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            AI Optimized PDF Resume
                                        </div>

                                        <h3 className="resume-card__title">
                                            Resume - {report.title || 'Target Role'}
                                        </h3>

                                        <p className="resume-card__meta">
                                            Generated on {new Date(report.createdAt).toLocaleDateString()} &bull; Match Score: {report.matchScore}%
                                        </p>

                                        <button
                                            className="resume-card__download"
                                            onClick={() => getResumePdf(report._id)}
                                            disabled={isDownloading}
                                        >
                                            {isDownloading ? (
                                                <>Generating PDF...</>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                    Download Tailored Resume PDF
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                </svg>
                            </div>
                            <h3>No Tailored Resumes Found</h3>
                            <p>
                                {searchTerm
                                    ? `No resumes matching "${searchTerm}".`
                                    : "You haven't generated any tailored resumes yet. Create an interview strategy to generate your ATS-friendly resume."}
                            </p>
                        </div>
                    )
                )}
            </main>
        </div>
    )
}

export default Dashboard
