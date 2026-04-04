import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15,45,66,0.96)', borderRadius: '10px',
      padding: '10px 14px', color: 'white', fontSize: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', minWidth: 160
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4 }}>
        Sem. {label}
      </p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '3px 0' }}>
          {p.name}: <strong>{p.value ?? '—'}{p.name === 'RPE' ? '/10' : ' u.a.'}</strong>
        </p>
      ))}
    </div>
  )
}

export function RPELineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Sem dados suficientes para exibir
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        {/* Left Y axis for RPE (0-10) */}
        <YAxis
          yAxisId="rpe"
          domain={[0, 10]}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
          orientation="left"
        />
        {/* Right Y axis for sRPE */}
        <YAxis
          yAxisId="srpe"
          orientation="right"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
        />
        <Line
          yAxisId="rpe"
          type="monotone"
          dataKey="avgRPE"
          name="RPE"
          stroke="var(--color-secondary)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: 'var(--color-secondary)', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
        <Line
          yAxisId="srpe"
          type="monotone"
          dataKey="srpe"
          name="sRPE"
          stroke="var(--color-warning)"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={{ r: 4, fill: 'var(--color-warning)', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
