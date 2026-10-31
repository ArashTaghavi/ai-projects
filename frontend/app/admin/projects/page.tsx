import Link from "next/link";
import { ArrowRight, FileText, FolderKanban } from "lucide-react";
import AdminPage from "../_components/layout/AdminPage";

export default function ProjectsPage() {
    return (
        <AdminPage
            title="Projects"
            description="Explore your AI projects."
            icon={<FolderKanban size={22} />}
        >
            <Link
                href="/admin/projects/chat-with-document"
                className="flex items-center gap-4 p-6 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400"
            >
                <FileText className="shrink-0 text-violet-300" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                    <h2 className="font-medium text-white">Chat with document</h2>
                    <p className="mt-1 text-sm text-ui-secondary">
                        Upload a Word document and ask questions about it.
                    </p>
                </div>
                <ArrowRight size={18} className="shrink-0 text-ui-secondary" aria-hidden="true" />
            </Link>
        </AdminPage>
    );
}
