'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Phone,
  Send
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Result = {
  "Issue Type": string
  "Impact Area": string[]
  "Priority Score": string
  "Action Plan": string[]
  "Estimated Risk Reduction": string
  "Emergency Numbers to Call": Record<string, string>
}

export default function Home() {
  const [issue, setIssue] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState('')

  const analyzeIssue = async () => {
    if (!issue.trim()) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_text: issue })
      })

      if (!res.ok) throw new Error('API failed')

      const data = await res.json()
      setResults(data)
    } catch {
      setError('Unable to analyze issue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 to-slate-800 text-white p-6 break-words">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center items-center gap-2 mb-2">
            <ShieldAlert className="text-red-500" size={36} />
            <h1 className="text-3xl md:text-4xl font-bold">NAGAR AI</h1>
          </div>
          <p className="text-slate-300">
            India-focused AI for Urban Safety & Civic Intelligence
          </p>
        </motion.div>

        {/* INPUT */}
        <Card className="bg-slate-900 border-slate-700 mb-8">
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="Describe your urban issue to get an AI-agent powered solution
(e.g. garbage, crime, traffic)"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              rows={4}
            />

            <Button
              onClick={analyzeIssue}
              disabled={loading}
              className="w-full flex gap-2 text-base md:text-lg"
            >
              {loading ? 'Analyzing...' : 'Analyze Issue'}
              <Send size={18} />
            </Button>

            {error && (
              <p className="text-red-400 text-center">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* RESULTS */}
        <div className="space-y-6">
          {results.map((item, index) => {
            const priority = parseInt(item["Priority Score"])
            const borderColor =
              priority >= 9
                ? 'border-red-500'
                : priority >= 7
                ? 'border-yellow-500'
                : 'border-green-500'

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`bg-slate-900 border-l-4 ${borderColor}`}>
                  <CardContent className="p-4 md:p-6 space-y-3">

                    <h2 className="text-2xl font-semibold flex gap-2 items-center">
                      <AlertTriangle className="text-orange-400" />
                      {item["Issue Type"]}
                    </h2>

                    <p className="flex gap-2 items-center text-slate-300">
                      <MapPin size={16} />
                      <strong>Impact Area:</strong>{' '}
                      {item["Impact Area"].join(', ')}
                    </p>

                    <p>
                      <strong>Priority:</strong>{' '}
                      {item["Priority Score"]}
                    </p>

                    <div>
                      <p className="font-semibold">Action Plan:</p>
                      <ul className="list-disc list-inside text-slate-300">
                        {item["Action Plan"].map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <p>
                      <strong>Risk Reduction:</strong>{' '}
                      {item["Estimated Risk Reduction"]}
                    </p>

                    {Object.keys(item["Emergency Numbers to Call"]).length > 0 && (
                      <div>
                        <p className="font-semibold flex gap-2 items-center">
                          <Phone size={16} />
                          Emergency Numbers
                        </p>
                        <ul className="list-disc list-inside text-slate-300">
                          {Object.entries(
                            item["Emergency Numbers to Call"]
                          ).map(([name, number]) => (
                            <li key={name}>
                              {name}: {number}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
