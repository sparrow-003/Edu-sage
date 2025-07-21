export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                <h1 className="text-4xl font-bold mb-6">🎓 EduSage AI Platform</h1>
                <p className="text-xl mb-4">A comprehensive AI-powered educational platform</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="p-6 border rounded-lg">
                        <h2 className="text-2xl font-semibold mb-2">Learn</h2>
                        <p>Access AI-powered learning resources</p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h2 className="text-2xl font-semibold mb-2">Create</h2>
                        <p>Build your own educational content</p>
                    </div>
                </div>
            </div>
        </main>
    );
}