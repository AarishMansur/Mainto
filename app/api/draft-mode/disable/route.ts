import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const draftMode = await import('next/headers').then((m) => m.draftMode())
  draftMode.disable()
  return NextResponse.redirect(new URL('/', request.url))
}
