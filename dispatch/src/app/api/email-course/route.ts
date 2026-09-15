import { NextResponse } from 'next/server'
import { isDatabaseConfigured } from '@/lib/db'
import { CourseError } from '@/lib/emailCourse'
import { executeCourseCommand, validateCommand } from '@/lib/emailCourseStore'
import { TRAINING_CONFIG } from '@/lib/trainingConfig'

export async function POST(request: Request) {
  if (!TRAINING_CONFIG.phaseProgressionEnabled) return NextResponse.json({ error: 'Phase progression is currently disabled. Use regular task practice.' }, { status: 409 })
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'The training database is not configured.' }, { status: 503 })
  try {
    const input: unknown = await request.json()
    validateCommand(input)
    return NextResponse.json(await executeCourseCommand(input), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 })
    if (error instanceof CourseError) return NextResponse.json({ error: error.message }, { status: error.status })
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
    console.error('Email course request failed:', code ?? 'unknown')
    return NextResponse.json({ error: code === '42P01'
      ? 'The email-course database upgrade has not been applied yet.'
      : 'Your course could not be saved. Retry to safely resume.' }, { status: 503 })
  }
}
