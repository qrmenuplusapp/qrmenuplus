import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const url = req.nextUrl.clone()

  const mainDomain = 'qrmenu.it.com'
  const wwwDomain = 'www.qrmenu.it.com'

  // تجاهل الدومين الرئيسي
  if (hostname === mainDomain || hostname === wwwDomain) {
    return NextResponse.next()
  }

  // تجاهل localhost
  if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
    return NextResponse.next()
  }

  // استخراج الـ subdomain
  // hostname سيكون مثل: alfanar.qrmenu.it.com
  const subdomain = hostname.replace(`.${mainDomain}`, '')

  // إذا كان subdomain حقيقي وليس نفس الدومين
  if (subdomain && subdomain !== hostname && subdomain !== 'www') {
    url.pathname = `/menu/${subdomain}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
