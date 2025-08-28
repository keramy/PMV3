
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GeminiPreviewPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Gemini UI Preview</CardTitle>
            <CardDescription className="text-lg text-gray-800 max-w-md mx-auto">
                This section is dedicated to building enhanced UI components using only shadcn/ui,
                following the project's established brand and component guidelines.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-gray-700 mb-6">Select a component from the sidebar to get started.</p>
            <div className="flex justify-center gap-4">
                <Button asChild>
                    <Link href="/gemini-preview/dashboard">View Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                     <Link href="/gemini-preview/projects">View Projects</Link>
                </Button>
            </div>
        </CardContent>
    </div>
  );
}
