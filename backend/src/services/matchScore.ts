type ScoringInput = {
  student: {
    course: string
    yearOfStudy: number
    skills: string[]
  }
  internship: {
    field: string
    minYear: number
    maxYear: number
    skills: string[]
  }
}

export type ScoreResult = {
  total: number
  breakdown: { field: number; skills: number; year: number }
}

const FIELD_MAP: Record<string, string[]> = {
  'Computer Science':        ['Software Engineering', 'Data Science', 'Cybersecurity', 'AI/ML'],
  'Information Technology':  ['Software Engineering', 'Data Science', 'IT Support'],
  'Finance':                 ['Finance', 'Accounting', 'Fintech'],
  'Business Administration': ['Marketing', 'Operations', 'Finance', 'HR'],
  'Design':                  ['Design', 'UI/UX', 'Product Design'],
  'Engineering':             ['Software Engineering', 'Hardware', 'Manufacturing'],
}

function norm(s: string) { return s.toLowerCase().trim() }

function fieldScore(course: string, field: string): number {
  if (norm(course) === norm(field)) return 40
  const related = FIELD_MAP[course] ?? []
  if (related.some(f => norm(f) === norm(field))) return 24
  return 0
}

function skillScore(studentSkills: string[], internSkills: string[]): number {
  if (!internSkills.length) return 0
  const matches = studentSkills.filter(s =>
    internSkills.some(i => norm(i).includes(norm(s)) || norm(s).includes(norm(i)))
  )
  return Math.round((matches.length / internSkills.length) * 35)
}

function yearScore(year: number, min: number, max: number): number {
  return year >= min && year <= max ? 25 : 0
}

export function computeMatchScore(input: ScoringInput): ScoreResult {
  const field  = fieldScore(input.student.course, input.internship.field)
  const skills = skillScore(input.student.skills, input.internship.skills)
  const year   = yearScore(input.student.yearOfStudy, input.internship.minYear, input.internship.maxYear)
  return {
    total: Math.min(field + skills + year, 99),
    breakdown: { field, skills, year },
  }
}
