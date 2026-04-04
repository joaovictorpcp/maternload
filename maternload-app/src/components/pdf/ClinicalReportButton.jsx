import React, { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { ClinicalReportDocument } from './ClinicalReportDocument'
import { FileText } from 'lucide-react'
import { format } from 'date-fns'

export function ClinicalReportButton({ student, records, metrics, age }) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const doc = (
        <ClinicalReportDocument
          student={student}
          records={records}
          metrics={metrics}
          age={age}
        />
      )
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const nameSlug = student.full_name.split(' ').slice(0, 2).join('_')
      link.download = `Laudo_MaternLoad_${nameSlug}_${dateStr}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Erro ao gerar o laudo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      id="generate-pdf-btn"
      className="btn btn-primary"
      onClick={handleGenerate}
      disabled={loading || records.length === 0}
      title={records.length === 0 ? 'Sem registros para gerar o laudo' : 'Gerar Laudo Clínico em PDF'}
    >
      {loading ? (
        <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Gerando PDF...</>
      ) : (
        <><FileText size={16} /> Gerar Laudo Clínico (PDF)</>
      )}
    </button>
  )
}
