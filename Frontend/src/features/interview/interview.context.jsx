import { createContext, useState } from "react";

export const InterviewContext = createContext()

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [downloadingResumeId, setDownloadingResumeId] = useState(null)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])

    return (
        <InterviewContext.Provider value={{
            loading,
            setLoading,
            downloadingResumeId,
            setDownloadingResumeId,
            report,
            setReport,
            reports,
            setReports
        }}>
            {children}
        </InterviewContext.Provider>
    )
}