import Link from "next/link"

export default function Custom403() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-4xl font-bold">403</h1>
            <p className="mt-4 text-lg">Bu sayfaya erişim izniniz yok.</p>
            <Link href="/public" className="mt-6 text-blue-500 underline">
                Ana sayfaya dön
            </Link>
        </div>
    )
}