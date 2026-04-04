import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15,45,66,0.96)', borderRadius: '10px',
      padding: '10px 14px', color: 'white', fontSize: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', minWidth: 140
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4 }}>
        Sem. {label}
      </p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '3px 0' }}>
          {p.name}: <strong>{p.value} min</strong>
        </p>
      ))}
      <p style={{ color: '#aaa', marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 4 }}>
        Total: <strong style={{ color: 'white' }}>
          {payload.reduce((s, p) => s + (p.value || 0), 0)} min
        </strong>
      </p>
    </div>
  )
}

export function VolumeBarChart({ data }) {
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
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
          unit=" min"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
        />
        <ReferenceLine
          y={150}
          stroke="var(--color-danger)"
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{ value: 'Meta 150 min', position: 'insideTopRight', fontSize: 11, fill: 'var(--color-danger)' }}
        />
        <Bar dataKey="cardio" name="Cardio" fill="var(--color-accent)" radius={[4, 4, 0, 0]} stackId="volume" />
        <Bar dataKey="strength" name="Força" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} stackId="volume" />
      </BarChart>
    </ResponsiveContainer>
  )
}
