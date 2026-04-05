import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Estilos do PDF ──────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#1A202C',
    backgroundColor: '#FFFFFF',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 3,
    borderBottomColor: '#2E8B7A',
    paddingBottom: 16,
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  appName: {
    fontSize: 22, fontFamily: 'Helvetica-Bold',
    color: '#1A4A6B', letterSpacing: 1, marginBottom: 2
  },
  appTagline: { fontSize: 9, color: '#718096' },
  headerRight: { alignItems: 'flex-end' },
  headerLabel: { fontSize: 8, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1A4A6B', marginTop: 1 },

  // Document Title
  docTitle: {
    textAlign: 'center', fontSize: 14, fontFamily: 'Helvetica-Bold',
    color: '#1A4A6B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1
  },
  docSubtitle: { textAlign: 'center', fontSize: 9, color: '#718096', marginBottom: 20 },

  // Patient Info Box
  infoBox: {
    backgroundColor: '#F0F7FF', borderRadius: 6, padding: 14,
    marginBottom: 18, borderLeftWidth: 4, borderLeftColor: '#2E8B7A'
  },
  infoTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem: { flex: 1, minWidth: '45%' },
  infoLabel: { fontSize: 8, color: '#718096' },
  infoValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1A4A6B', marginTop: 1 },

  // Section
  sectionTitle: {
    fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1A4A6B',
    textTransform: 'uppercase', letterSpacing: 0.5,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    paddingBottom: 4, marginBottom: 10, marginTop: 14
  },

  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 6,
    padding: 10, alignItems: 'center', borderTopWidth: 2, borderTopColor: '#5BC4A8'
  },
  statLabel: { fontSize: 7, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  statValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1A4A6B' },
  statUnit: { fontSize: 8, color: '#718096', marginTop: 1 },

  // Table
  table: { marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1A4A6B', padding: 6, borderRadius: 4 },
  tableHeaderCell: { color: '#FFFFFF', fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 1, textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: 5, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  tableCell: { fontSize: 9, flex: 1, textAlign: 'center', color: '#4A5568' },
  tableCellBold: { fontFamily: 'Helvetica-Bold', color: '#1A202C' },

  // Checklist
  checklistItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: '5 0', borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  checkDot: { width: 10, height: 10, borderRadius: 5 },
  checkLabel: { fontSize: 9, flex: 1 },
  checkValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },

  // Progress Bar
  progressContainer: { marginBottom: 10 },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  progressLabelText: { fontSize: 9 },
  progressBar: { backgroundColor: '#E2E8F0', borderRadius: 4, height: 8 },
  progressFill: { height: 8, borderRadius: 4 },

  // Footer
  footer: {
    position: 'absolute', bottom: 30, left: 40, right: 40,
    borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'
  },
  footerText: { fontSize: 8, color: '#718096' },
  footerSignature: { alignItems: 'flex-end' },
  signatureLine: { width: 140, borderBottomWidth: 1, borderBottomColor: '#1A4A6B', marginBottom: 3 },
  signatureText: { fontSize: 8, color: '#1A4A6B', fontFamily: 'Helvetica-Bold' },
  signatureSubtext: { fontSize: 7, color: '#718096', marginTop: 1 },

  // Alert Badge
  alertBadge: {
    backgroundColor: '#FFF5F5', padding: '4 8',
    borderRadius: 4, borderWidth: 1, borderColor: '#FC8181'
  },
  alertBadgeText: { fontSize: 9, color: '#E53E3E', fontFamily: 'Helvetica-Bold' },

  okBadge: {
    backgroundColor: '#F0FFF4', padding: '4 8',
    borderRadius: 4, borderWidth: 1, borderColor: '#68D391'
  },
  okBadgeText: { fontSize: 9, color: '#38A169', fontFamily: 'Helvetica-Bold' },

  // Referências e Glossário
  appendixTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1A4A6B', marginBottom: 12, marginTop: 10, textTransform: 'uppercase' },
  glossaryItem: { marginBottom: 6, flexDirection: 'row', alignItems: 'flex-start' },
  glossaryTerm: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#2E8B7A', width: 70 },
  glossaryDesc: { fontSize: 9, color: '#4A5568', flex: 1, lineHeight: 1.4 },
  
  refTable: { marginTop: 8, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4 },
  refTableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  refHeaderCell: { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1A4A6B' },
  refTableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  refTableCell: { flex: 1, fontSize: 8, color: '#4A5568' },
})

// Desativar a separação silábica automática padrão do react-pdf para evitar erros gramaticais e hifens indevidos
Font.registerHyphenationCallback(word => [word]);

// ─── Componente do Documento PDF ──────────────────────────────────
export function ClinicalReportDocument({ student, records, metrics, age }) {
  const today = new Date()
  const emissionDate = format(today, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  // Período do relatório
  const sortedDates = records.map(r => r.workout_date).sort()
  const periodStart = sortedDates[0] ? format(parseISO(sortedDates[0]), 'dd/MM/yyyy') : '—'
  const periodEnd = sortedDates[sortedDates.length - 1] ? format(parseISO(sortedDates[sortedDates.length - 1]), 'dd/MM/yyyy') : '—'

  // Alertas totais nos registros
  const totalAlerts = records.filter(r => r.has_alert).length
  const bleedingCount = records.filter(r => r.alert_bleeding).length
  const dizzinessCount = records.filter(r => r.alert_dizziness).length
  const fluidLossCount = records.filter(r => r.alert_fluid_loss).length
  const pelvicPainCount = records.filter(r => r.alert_pelvic_pain).length

  // Talk test
  const failedTalkTest = records.filter(r => !r.talk_test).length
  const passedTalkTest = records.filter(r => r.talk_test).length
  const talkTestPct = records.length > 0 ? Math.round((passedTalkTest / records.length) * 100) : 0

  // Volume ACOG total
  const totalVolume = records.reduce((s, r) => s + (r.total_minutes || 0), 0)
  const avgWeeklyVolume = metrics.weeklyData.length > 0
    ? Math.round(metrics.weeklyData.reduce((s, w) => s + w.total, 0) / metrics.weeklyData.filter(w => w.sessions > 0).length || 0)
    : 0

  // Últimas 6 semanas com dados
  const weeksWithData = metrics.weeklyData.filter(w => w.sessions > 0).slice(-8)

  const Footer = () => (
    <View style={styles.footer} fixed>
      <View>
        <Text style={styles.footerText}>MaternLoad — Sistema de Controle de Carga para Gestantes</Text>
        <Text style={[styles.footerText, { marginTop: 2 }]}>Documento gerado em {emissionDate}</Text>
      </View>
      <View style={styles.footerSignature}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureText}>João Victor Pinheiro Coelho Pedrosa</Text>
        <Text style={styles.signatureSubtext}>Personal Trainer — CREF: _______________</Text>
      </View>
    </View>
  )

  return (
    <Document title={`Laudo Clínico — ${student.full_name}`}>
      <Page size="A4" style={styles.page}>

        {/* ─── CABEÇALHO ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>MaternLoad</Text>
            <Text style={styles.appTagline}>Sistema de Monitoramento de Carga para Gestantes</Text>
            <Text style={[styles.appTagline, { marginTop: 4, color: '#1A4A6B' }]}>
              Personal Trainer: João Victor Pinheiro Coelho Pedrosa
            </Text>
            <Text style={styles.appTagline}>CREF: _______________</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Emissão</Text>
            <Text style={styles.headerValue}>{emissionDate}</Text>
            <Text style={[styles.headerLabel, { marginTop: 6 }]}>Período</Text>
            <Text style={styles.headerValue}>{periodStart} a {periodEnd}</Text>
          </View>
        </View>

        {/* ─── TÍTULO DO DOCUMENTO ───────────────────────────────── */}
        <Text style={styles.docTitle}>Laudo de Controle de Carga de Treinamento</Text>
        <Text style={styles.docSubtitle}>Documento confidencial — uso exclusivo do profissional e da aluna</Text>

        {/* ─── IDENTIFICAÇÃO DA ALUNA ─────────────────────────── */}
        <View style={styles.infoBox} wrap={false}>
          <Text style={styles.infoTitle}>Identificação da Aluna</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nome Completo</Text>
              <Text style={styles.infoValue}>{student.full_name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: student.status === 'ativa' ? '#38A169' : '#718096' }]}>
                {student.status === 'ativa' ? '● Ativa' : '○ Inativa'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data Prevista do Parto (DPP)</Text>
              <Text style={styles.infoValue}>
                {student.due_date ? format(parseISO(student.due_date), "dd/MM/yyyy") : 'Não informada'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Semana Gestacional (na emissão)</Text>
              <Text style={[styles.infoValue, { color: '#2E8B7A' }]}>
                {age.isValid ? `${age.weeks}ª semana — ${age.trimesterLabel}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total de Sessões no Período</Text>
              <Text style={styles.infoValue}>{records.length} sessões</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Volume Total no Período</Text>
              <Text style={styles.infoValue}>{totalVolume} minutos</Text>
            </View>
          </View>
        </View>

        {/* ─── MEDIDAS CORPORAIS ─────────────────────────── */}
        {(student.weight || student.height || student.circumferences?.abdomen) && (
          <View style={[styles.infoBox, { borderLeftColor: '#38A169', marginBottom: 18 }]} wrap={false}>
            <Text style={styles.infoTitle}>Medidas Corporais</Text>
            <View style={styles.infoGrid}>
              {student.weight && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Peso Atual</Text>
                  <Text style={styles.infoValue}>{student.weight} kg</Text>
                </View>
              )}
              {student.height && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Altura</Text>
                  <Text style={styles.infoValue}>{student.height} m</Text>
                </View>
              )}
              {student.circumferences?.abdomen && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Abdômen</Text>
                  <Text style={styles.infoValue}>{student.circumferences.abdomen} cm</Text>
                </View>
              )}
              {student.circumferences?.hip && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Quadril</Text>
                  <Text style={styles.infoValue}>{student.circumferences.hip} cm</Text>
                </View>
              )}
              {student.circumferences?.thighRight && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Coxa Dir.</Text>
                  <Text style={styles.infoValue}>{student.circumferences.thighRight} cm</Text>
                </View>
              )}
              {student.circumferences?.thighLeft && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Coxa Esq.</Text>
                  <Text style={styles.infoValue}>{student.circumferences.thighLeft} cm</Text>
                </View>
              )}
              {student.circumferences?.thorax && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Tórax</Text>
                  <Text style={styles.infoValue}>{student.circumferences.thorax} cm</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ─── SEÇÃO 1: VOLUME DE TREINAMENTO ────────────────────── */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>1. Volume de Treinamento (ACOG)</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Volume Semana Atual</Text>
              <Text style={styles.statValue}>{metrics.weeklyVolume}</Text>
              <Text style={styles.statUnit}>minutos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Meta ACOG</Text>
              <Text style={styles.statValue}>150</Text>
              <Text style={styles.statUnit}>min/semana</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>% Meta Atingida</Text>
              <Text style={[styles.statValue, { color: metrics.acogPercent >= 100 ? '#38A169' : '#2E8B7A' }]}>
                {metrics.acogPercent}%
              </Text>
              <Text style={styles.statUnit}>{metrics.acogPercent >= 100 ? '✓ Atingida' : 'Em progresso'}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Média Semanal</Text>
              <Text style={styles.statValue}>{avgWeeklyVolume}</Text>
              <Text style={styles.statUnit}>min/semana</Text>
            </View>
          </View>

          {/* Volume progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabel}>
              <Text style={styles.progressLabelText}>Meta ACOG — Semana Atual</Text>
              <Text style={[styles.progressLabelText, { fontFamily: 'Helvetica-Bold' }]}>
                {metrics.weeklyVolume} / 150 min ({metrics.acogPercent}%)
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${Math.min(metrics.acogPercent, 100)}%`,
                backgroundColor: metrics.acogPercent >= 100 ? '#38A169' : '#2E8B7A'
              }]} />
            </View>
          </View>
        </View>

        {/* Weekly volume table */}
        {weeksWithData.length > 0 && (
          <View style={styles.table} wrap={false}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Semana</Text>
              <Text style={styles.tableHeaderCell}>Cardio (min)</Text>
              <Text style={styles.tableHeaderCell}>Força (min)</Text>
              <Text style={styles.tableHeaderCell}>Total (min)</Text>
              <Text style={styles.tableHeaderCell}>Sessões</Text>
              <Text style={styles.tableHeaderCell}>% Meta</Text>
            </View>
            {weeksWithData.map((w, i) => (
              <View key={w.weekStart} style={[styles.tableRow, i % 2 !== 0 && styles.tableRowAlt]}>
                <Text style={styles.tableCell}>{w.week}</Text>
                <Text style={styles.tableCell}>{w.cardio}</Text>
                <Text style={styles.tableCell}>{w.strength}</Text>
                <Text style={[styles.tableCell, styles.tableCellBold]}>{w.total}</Text>
                <Text style={styles.tableCell}>{w.sessions}</Text>
                <Text style={[styles.tableCell, {
                  color: w.total >= 150 ? '#38A169' : '#E53E3E', fontFamily: 'Helvetica-Bold'
                }]}>
                  {Math.round((w.total / 150) * 100)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ─── SEÇÃO 2: PERCEPÇÃO DE ESFORÇO ─────────────────────── */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>2. Percepção de Esforço e Carga Interna</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>RPE Médio (7 dias)</Text>
              <Text style={[styles.statValue, {
                color: metrics.avgRPE >= 8 ? '#E53E3E' : metrics.avgRPE >= 6 ? '#D97706' : '#2E8B7A'
              }]}>{metrics.avgRPE ?? '—'}</Text>
              <Text style={styles.statUnit}>de 0 a 10</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>sRPE Acumulado</Text>
              <Text style={styles.statValue}>{metrics.avgLoad}</Text>
              <Text style={styles.statUnit}>u.a.</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Monotonia</Text>
              <Text style={[styles.statValue, { color: metrics.monotony > 2 ? '#E53E3E' : '#2E8B7A' }]}>
                {metrics.monotony || '—'}
              </Text>
              <Text style={styles.statUnit}>{metrics.monotony > 2 ? 'ALTA' : 'Normal'}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Strain</Text>
              <Text style={styles.statValue}>{metrics.strain || '—'}</Text>
              <Text style={styles.statUnit}>u.a.</Text>
            </View>
          </View>
        </View>

        {/* ─── SEÇÃO 3: BEM-ESTAR (HOOPER INDEX) ─────────────────── */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>3. Bem-Estar — Hooper Index (Média 7 dias)</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Hooper Total Médio</Text>
              <Text style={[styles.statValue, {
                color: metrics.avgHooper > 20 ? '#E53E3E' : metrics.avgHooper > 14 ? '#D97706' : '#38A169'
              }]}>{metrics.avgHooper ?? '—'}</Text>
              <Text style={styles.statUnit}>de 4 a 28</Text>
            </View>
            {metrics.hooperComponents && (
              <>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Sono</Text>
                  <Text style={styles.statValue}>{metrics.hooperComponents.sleep}</Text>
                  <Text style={styles.statUnit}>de 1 a 7</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Fadiga</Text>
                  <Text style={styles.statValue}>{metrics.hooperComponents.fatigue}</Text>
                  <Text style={styles.statUnit}>de 1 a 7</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Estresse</Text>
                  <Text style={styles.statValue}>{metrics.hooperComponents.stress}</Text>
                  <Text style={styles.statUnit}>de 1 a 7</Text>
                </View>
              </>
            )}
          </View>
          {metrics.hooperComponents && (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Dor Muscular</Text>
                <Text style={styles.statValue}>{metrics.hooperComponents.musclePain}</Text>
                <Text style={styles.statUnit}>de 1 a 7</Text>
              </View>
              {/* Espaçadores vazios para alinhar o card de dor muscular à esquerda */}
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
            </View>
          )}
        </View>

        {/* ─── SEÇÃO 4: CHECKLIST DE SEGURANÇA ───────────────────── */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>4. Checklist de Segurança — Sinais de Alerta</Text>

          <View>
            {[
              { label: 'Sangramento', count: bleedingCount, emoji: '🩸' },
              { label: 'Tontura', count: dizzinessCount, emoji: '😵' },
              { label: 'Perda de Líquido Amniótico', count: fluidLossCount, emoji: '💧' },
              { label: 'Dor Pélvica / Lombar Atípica', count: pelvicPainCount, emoji: '⚠' },
            ].map(({ label, count }) => (
              <View key={label} style={styles.checklistItem}>
                <View style={[styles.checkDot, { backgroundColor: count > 0 ? '#E53E3E' : '#38A169' }]} />
                <Text style={styles.checkLabel}>{label}</Text>
                {count > 0 ? (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>{count} ocorrência{count > 1 ? 's' : ''}</Text>
                  </View>
                ) : (
                  <View style={styles.okBadge}>
                    <Text style={styles.okBadgeText}>Nenhuma ocorrência</Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.checklistItem}>
              <View style={[styles.checkDot, { backgroundColor: failedTalkTest > 0 ? '#D97706' : '#38A169' }]} />
              <Text style={styles.checkLabel}>Talk Test — Falhas (sem fôlego durante o treino)</Text>
              {failedTalkTest > 0 ? (
                <View style={[styles.alertBadge, { borderColor: '#F6AD55', backgroundColor: '#FFFBEB' }]}>
                  <Text style={[styles.alertBadgeText, { color: '#D97706' }]}>
                    {failedTalkTest} falha{failedTalkTest > 1 ? 's' : ''} de {records.length}
                  </Text>
                </View>
              ) : (
                <View style={styles.okBadge}>
                  <Text style={styles.okBadgeText}>100% aprovado</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Alerta geral */}
        {totalAlerts > 0 && (
          <View style={{
            backgroundColor: '#FFF5F5', borderRadius: 6, padding: 10, marginTop: 12,
            borderWidth: 1, borderColor: '#FC8181', flexDirection: 'row', gap: 8, alignItems: 'center'
          }} wrap={false}>
            <Text style={{ fontSize: 14 }}>⚠</Text>
            <Text style={{ fontSize: 9, color: '#E53E3E', flex: 1, lineHeight: 1.4 }}>
              ATENÇÃO: Foram registrados {totalAlerts} evento{totalAlerts > 1 ? 's' : ''} com sinal de alerta no período analisado.
              Recomenda-se avaliação clínica e revisão do plano de treinamento.
            </Text>
          </View>
        )}

        <Footer />
      </Page>

      {/* ─── PÁGINA 2: ANEXO / LEGENDA ───────────────────────────── */}
      <Page size="A4" style={styles.page}>
        
        {/* Cabeçalho Simplificado */}
        <View style={[styles.header, { marginBottom: 10, paddingBottom: 10 }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>MaternLoad</Text>
            <Text style={styles.appTagline}>Anexo 1: Glossário e Valores de Referência</Text>
          </View>
        </View>

        {/* Glossário de Siglas */}
        <Text style={styles.appendixTitle}>1. Glossário de Siglas e Termos Correntes</Text>

        <View style={styles.glossaryItem}>
          <Text style={styles.glossaryTerm}>ACOG</Text>
          <Text style={styles.glossaryDesc}>American College of Obstetricians and Gynecologists (Colégio Americano de Obstetras e Ginecologistas). Recomenda-se a prática de 150 minutos semanais de atividade física de intensidade moderada para gestantes saudáveis sem contraindicações relativas ou absolutas.</Text>
        </View>
        <View style={styles.glossaryItem}>
          <Text style={styles.glossaryTerm}>DPP</Text>
          <Text style={styles.glossaryDesc}>Data Prevista do Parto. Estimativa clínica baseada na data da última menstruação ou em exame ultrassonográfico, projetando um termo de 40 semanas gestacionais.</Text>
        </View>
        <View style={styles.glossaryItem}>
          <Text style={styles.glossaryTerm}>RPE</Text>
          <Text style={styles.glossaryDesc}>Percepção Subjetiva de Esforço (Rating of Perceived Exertion). Escala validada cientificamente (0 a 10) para a quantificação psicofísica da percepção de intensidade e exaustão associada à referida sessão de exercício.</Text>
        </View>
        <View style={styles.glossaryItem}>
          <Text style={styles.glossaryTerm}>sRPE</Text>
          <Text style={styles.glossaryDesc}>Carga Interna da Sessão (Session RPE). Produto da multiplicação do RPE médio reportado pela duração da sessão (em minutos). O índice mensura de forma apurada o impacto fisiológico e o estresse sistêmico induzido pela sessão de treinamento, expresso em Unidades Arbitrárias (u.a.).</Text>
        </View>
        <View style={styles.glossaryItem}>
          <Text style={styles.glossaryTerm}>Monotonia</Text>
          <Text style={styles.glossaryDesc}>Índice indicativo da variabilidade da carga de treinamento interdiária. Valores superiores a 2,0 denotam baixa variabilidade (treinamento monótono), condição patológica que eleva significativamente o risco de desenvolvimento de fadiga excessiva, morbidades musculoesqueléticas ou falha crônica na adaptação metabólica.</Text>
        </View>
        <View style={styles.glossaryItem}>
          <Text style={styles.glossaryTerm}>Strain</Text>
          <Text style={styles.glossaryDesc}>Grau de tensão orgânica induzida. Calculado de forma preditiva através do produto algébrico da Carga de Treinamento e sua referida Monotonia. Este indicador permite dimensionar com exatidão a agressão sistêmica e avaliar a segurança a adaptações crônicas negativas.</Text>
        </View>
        <View style={styles.glossaryItem}>
          <Text style={styles.glossaryTerm}>Hooper Index</Text>
          <Text style={styles.glossaryDesc}>Instrumento clínico validado para a aferição da percepção sinérgica de saúde da aluna e detecção pregressa de overtraining sob os domínios autodeclarados referentes a: Qualidade Reparadora do Sono, Sobrecarga Sistêmica de Estresse, Indução de Fadiga Geral, e níveis algésicos de Dor Muscular de Início Tardio (DMIT).</Text>
        </View>

        {/* Tabelas de Referência */}
        <Text style={[styles.appendixTitle, { marginTop: 20 }]}>2. Valores de Referência (Escalas Clínicas)</Text>

        <Text style={styles.sectionTitle}>Escala Hooper Index (Bem-Estar em Geral)</Text>
        <View style={styles.refTable}>
          <View style={styles.refTableHeader}>
            <Text style={styles.refHeaderCell}>Classificação Geral</Text>
            <Text style={styles.refHeaderCell}>Soma Total (4 a 28)</Text>
            <Text style={styles.refHeaderCell}>Critério Individual (1 a 7)</Text>
          </View>
          <View style={styles.refTableRow}>
            <Text style={[styles.refTableCell, { color: '#38A169', fontFamily: 'Helvetica-Bold' }]}>Ótimo / Muito Bom</Text>
            <Text style={styles.refTableCell}>4 a 14 pontos</Text>
            <Text style={styles.refTableCell}>1 ou 2</Text>
          </View>
          <View style={[styles.refTableRow, { backgroundColor: '#F8FAFC' }]}>
            <Text style={[styles.refTableCell, { color: '#D97706', fontFamily: 'Helvetica-Bold' }]}>Atenção / Risco Moderado</Text>
            <Text style={styles.refTableCell}>15 a 20 pontos</Text>
            <Text style={styles.refTableCell}>3 a 5</Text>
          </View>
          <View style={[styles.refTableRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.refTableCell, { color: '#E53E3E', fontFamily: 'Helvetica-Bold' }]}>Ruim / Alerta Severo</Text>
            <Text style={styles.refTableCell}>Acima de 20 pontos</Text>
            <Text style={styles.refTableCell}>6 ou 7</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Percepção de Esforço (RPE da Sessão)</Text>
        <View style={styles.refTable}>
          <View style={styles.refTableHeader}>
            <Text style={styles.refHeaderCell}>Zona de Esforço</Text>
            <Text style={styles.refHeaderCell}>Escala CR-10</Text>
            <Text style={styles.refHeaderCell}>Descrição Aplicada (Talk Test)</Text>
          </View>
          <View style={styles.refTableRow}>
            <Text style={[styles.refTableCell, { color: '#38A169', fontFamily: 'Helvetica-Bold' }]}>Leve / Baixa Exigência</Text>
            <Text style={styles.refTableCell}>0 a 3</Text>
            <Text style={styles.refTableCell}>Volume respiratório perfeitamente controlado. A gestante evidencia a capacidade de formular longo diálogo contínuo de métrica verbal regular.</Text>
          </View>
          <View style={[styles.refTableRow, { backgroundColor: '#F8FAFC' }]}>
            <Text style={[styles.refTableCell, { color: '#2E8B7A', fontFamily: 'Helvetica-Bold' }]}>Moderado</Text>
            <Text style={styles.refTableCell}>4 a 6</Text>
            <Text style={styles.refTableCell}>Metabolismo em nível desejado de adaptação de acordo com diretrizes das entidades internacionais vigentes. Permite a emissão de diálogos entre as incursões dos ciclos inspiratórios, com aumento da taxa respiratória.</Text>
          </View>
          <View style={[styles.refTableRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.refTableCell, { color: '#E53E3E', fontFamily: 'Helvetica-Bold' }]}>Intenso a Limiar Crítico</Text>
            <Text style={styles.refTableCell}>7 a 10</Text>
            <Text style={styles.refTableCell}>Aviso clínico desfavorável não sendo prescrito como abordagem contínua padrão para as características deste público alvo. O esforço cardiorrespiratório máximo afeta severamente a capacidade fonatória.</Text>
          </View>
        </View>

        <Footer />
      </Page>
    </Document>
  )
}
