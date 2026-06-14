import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function fmt(n) { return n != null ? '$' + Number(n).toLocaleString() : '—' }

const COLOR = '#C4717A'

const inputStyle = {
  background: '#0E0C08',
  border: '1px solid #2A3530',
  borderRadius: '0.5rem',
  padding: '0.75rem 1rem',
  color: '#F0EDE8',
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontFamily: 'monospace',
  fontSize: '0.55rem',
  letterSpacing: '0.12em',
  color: '#3A4A40',
  marginBottom: '0.4rem',
  display: 'block',
}

export default function DebtPayoff() {
  const [debt, setDebt]       = useState('')
  const [payment, setPayment] = useState('')
  const [rate, setRate]       = useState('')

  const calc = useCallback(() => {
    const principal = parseFloat(debt.replace(/,/g, ''))
    const monthly   = parseFloat(payment.replace(/,/g, ''))
    const annual    = parseFloat(rate)
    if (!principal || !monthly || monthly <= 0) return null

    if (!annual || annual === 0) {
      const months = Math.ceil(principal / monthly)
      const payoffDate = new Date()
      payoffDate.setMonth(payoffDate.getMonth() + months)
      return { months, totalInterest: 0, totalPaid: principal, payoffDate }
    }

    const r = annual / 100 / 12
    if (monthly <= principal * r) return { error: 'Monthly payment too low to cover interest.' }

    let balance = principal, months = 0, totalInterest = 0
    while (balance > 0 && months < 600) {
      const interestCharge = balance * r
      totalInterest += interestCharge
      balance = balance + interestCharge - monthly
      months++
      if (balance < 0) balance = 0
    }

    const payoffDate = new Date()
    payoffDate.setMonth(payoffDate.getMonth() + months)
    return { months, totalInterest, totalPaid: principal + totalInterest, payoffDate }
  }, [debt, payment, rate])

  const result = calc()

  return (
    <div className="page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) 1.5rem' }}>

        <Link to="/" style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#3A4A40', letterSpacing: '0.1em', marginBottom: '3rem' }}>← back</p>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.25em', color: COLOR, marginBottom: '1rem' }}>TOOL</p>
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.1, marginBottom: '0.75rem' }}>
            Debt payoff<br /><span style={{ fontStyle: 'italic', color: COLOR }}>calculator.</span>
          </h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#6A7A66', lineHeight: 1.7 }}>
            Enter your balance, monthly payment, and interest rate to see exactly when you're out.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>TOTAL DEBT ($)</label>
            <input style={inputStyle} placeholder="e.g. 25000" value={debt} onChange={e => setDebt(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>MONTHLY PAYMENT ($)</label>
            <input style={inputStyle} placeholder="e.g. 2100" value={payment} onChange={e => setPayment(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>INTEREST RATE (%)</label>
            <input style={inputStyle} placeholder="e.g. 22" value={rate} onChange={e => setRate(e.target.value)} />
          </div>
        </div>

        {result?.error && (
          <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: COLOR }}>{result.error}</p>
        )}

        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '1.25rem', background: '#0A0905', borderRadius: '0.75rem', border: `1px solid ${COLOR}22` }}>
              <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.4rem' }}>DEBT-FREE IN</p>
              <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', color: COLOR }}>
                {result.months < 12 ? `${result.months} mo` : `${Math.floor(result.months / 12)}y ${result.months % 12}mo`}
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#4A6A5A', marginTop: '0.25rem' }}>
                {result.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div style={{ padding: '1.25rem', background: '#0A0905', borderRadius: '0.75rem', border: '1px solid #1C2320' }}>
              <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.4rem' }}>TOTAL INTEREST</p>
              <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', color: COLOR }}>{fmt(Math.round(result.totalInterest))}</p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#4A6A5A', marginTop: '0.25rem' }}>cost of carrying the debt</p>
            </div>
            <div style={{ padding: '1.25rem', background: '#0A0905', borderRadius: '0.75rem', border: '1px solid #1C2320' }}>
              <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.4rem' }}>TOTAL PAID</p>
              <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', color: '#F0EDE8' }}>{fmt(Math.round(result.totalPaid))}</p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#4A6A5A', marginTop: '0.25rem' }}>principal + interest</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
