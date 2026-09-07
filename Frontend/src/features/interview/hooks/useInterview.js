import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, downloadingResumeId, setDownloadingResumeId, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return { success: true, data: response.interviewReport }
            }
            return { success: false, message: response?.message || "Failed to generate report" }
        } catch (error) {
            console.error("Error generating report:", error)
            const errMsg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Failed to generate report. Please try again."
            return { success: false, message: errMsg }
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (id) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
        } catch (error) {
            console.error("Error fetching report by ID:", error)
        } finally {
            setLoading(false)
        }
        return null
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            if (response && response.interviewReports) {
                setReports(response.interviewReports)
                return response.interviewReports
            }
        } catch (error) {
            console.error("Error fetching reports:", error)
        } finally {
            setLoading(false)
        }
        return []
    }

    const getResumePdf = async (interviewReportId) => {
        if (!interviewReportId) return
        setDownloadingResumeId(interviewReportId)
        try {
            const data = await generateResumePdf({ interviewReportId })
            const blob = new Blob([ data ], { type: "application/pdf" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            setTimeout(() => {
                window.URL.revokeObjectURL(url)
            }, 1000)
        }
        catch (error) {
            console.error("Error downloading resume PDF:", error)
            let errMsg = "Failed to download resume PDF. Please try again."
            if (error?.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text()
                    const json = JSON.parse(text)
                    errMsg = json.error || json.message || errMsg
                } catch (_) {}
            } else if (error?.response?.data?.message) {
                errMsg = error.response.data.message
            }
            alert(errMsg)
        } finally {
            setDownloadingResumeId(null)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return {
        loading,
        downloadingResumeId,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }

}