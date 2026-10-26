import DocumentChatPreview from "./_components/DocumentChatPreview";
import CustomerSupportPreview from "./_components/CustomerSupportPreview";
import DatabaseAnalystPreview from "./_components/DatabaseAnalystPreview";
import DeepResearchPreview from "./_components/DeepResearchPreview";
import CodebaseAssistantPreview from "./_components/CodebaseAssistantPreview";
import ContractIntelligencePreview from "./_components/ContractIntelligencePreview";
import WorkflowAutomationPreview from "./_components/WorkflowAutomationPreview";
import MultiAgentPreview from "./_components/MultiAgentPreview";
import {
    Blocks,
    Braces,
    Database,
    FileSearch,
    Files,
    Headset,
    Network,
    ScanText,
    Sparkles,
    Workflow,
} from "lucide-react";

const projects = [
    {
        title: "Chat with Documents",
        level: "Intermediate",
        difficulty: "intermediate",
        icon: Files,
        skills: [
            "Document Parsing",
            "Chunking",
            "Embeddings",
            "Retrieval",
            "Reranking",
            "Citations",
        ],
    },
    {
        title: "AI Database Analyst",
        level: "Intermediate",
        difficulty: "intermediate",
        icon: Database,
        skills: ["Tool Calling", "SQL Generation", "Query Validation", "Structured Outputs"],
    },
    {
        title: "AI Customer Support",
        level: "Intermediate to Advanced",
        difficulty: "intermediate-advanced",
        icon: Headset,
        skills: ["Hybrid RAG", "Tool Integration", "Conversation Memory", "Human Handoff"],
    },
    {
        title: "Deep Research Agent",
        level: "Advanced",
        difficulty: "advanced",
        icon: FileSearch,
        skills: ["Planning", "Web Search", "Iterative Retrieval", "Source Verification"],
    },
    {
        title: "AI Codebase Assistant",
        level: "Advanced",
        difficulty: "advanced",
        icon: Braces,
        skills: ["Code Parsing", "AST", "Semantic Search", "Repository Indexing"],
    },
    {
        title: "Contract Intelligence",
        level: "Advanced",
        difficulty: "advanced",
        icon: ScanText,
        skills: ["Multimodal RAG", "OCR", "VLM", "Structured Extraction"],
    },
    {
        title: "AI Workflow Automation",
        level: "Expert",
        difficulty: "expert",
        icon: Workflow,
        skills: ["MCP", "Stateful Workflows", "Approval", "Durable Execution"],
    },
    {
        title: "Multi-Agent Workspace",
        level: "Expert",
        difficulty: "expert",
        icon: Network,
        skills: ["Agent Orchestration", "Supervisor", "Task Delegation", "Shared State"],
    },
] as const;

const difficultyStyles = {
    intermediate: "border-emerald-400/15 bg-emerald-400/8 text-emerald-300",
    "intermediate-advanced": "border-sky-400/15 bg-sky-400/8 text-sky-300",
    advanced: "border-amber-400/15 bg-amber-400/8 text-amber-300",
    expert: "border-violet-400/20 bg-violet-400/10 text-violet-300",
};

export default function AdminPage() {
    return (
        <div className="space-y-8">
            <section
                aria-labelledby="projects-title"
                className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-linear-to-br from-[#1b152d] via-[#15121f] to-[#111117] p-6 sm:p-8"
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-violet-500/10 blur-3xl"
                />
                <div className="relative flex flex-wrap items-start justify-between gap-6">
                    <div>
                        <p className="mb-4 flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-violet-300 uppercase">
                            <Sparkles size={14} aria-hidden="true" />
                            Build. Learn. Explore.
                        </p>
                        <h1
                            id="projects-title"
                            className="text-2xl font-semibold tracking-tight sm:text-3xl"
                        >
                            AI Projects
                        </h1>
                        <p
                            lang="en"
                            dir="ltr"
                            className="mt-3 max-w-xl text-start text-sm leading-7 text-zinc-400"
                        >
                            8 projects to build real-world AI experiences, from working with
                            documents to multi-agent systems.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                        <Blocks size={20} className="text-violet-300" aria-hidden="true" />
                        <div>
                            <p className="text-xl font-semibold tabular-nums">
                                {String(projects.length).padStart(2, "0")}
                            </p>
                            <p className="text-[10px] text-zinc-500">Projects</p>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-label="Project collection">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-medium text-zinc-200">Project collection</h2>
                    <span className="text-[11px] text-zinc-500">01 — 08</span>
                </div>
                <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
                    {projects.map(({ title, level, difficulty, icon: Icon, skills }, index) => (
                        <li key={title}>
                            <article
                                aria-labelledby={`project-${index + 1}`}
                                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#111117] transition duration-300 hover:border-violet-400/30 hover:bg-[#15121e] motion-reduce:transition-none ${index < 8 ? "p-4" : "p-5 sm:p-6"}`}
                            >
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-violet-400/0 to-transparent transition-colors duration-300 group-hover:via-violet-400/60 motion-reduce:transition-none"
                                />
                                <div
                                    className={`flex items-center justify-between gap-3 ${index < 8 ? "" : "mb-6"}`}
                                >
                                    <span
                                        className={`flex shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/8 text-violet-300 transition-colors group-hover:border-violet-400/30 group-hover:bg-violet-400/15 ${index < 8 ? "size-9" : "size-11"}`}
                                    >
                                        <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
                                    </span>
                                    {index < 8 && (
                                        <div className="min-w-0 flex-1">
                                            <h3
                                                id={`project-${index + 1}`}
                                                className="text-sm font-semibold tracking-tight text-zinc-100 sm:text-base"
                                            >
                                                {title}
                                            </h3>
                                            <span
                                                className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] leading-3 ${difficultyStyles[difficulty]}`}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="size-1 rounded-full bg-current"
                                                />
                                                {level}
                                            </span>
                                        </div>
                                    )}
                                    <span
                                        className="font-mono text-2xl font-medium tracking-tight text-zinc-700 transition-colors group-hover:text-violet-400/60"
                                        aria-label={`Project ${index + 1}`}
                                    >
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                {index >= 8 && (
                                    <>
                                        <h3
                                            id={`project-${index + 1}`}
                                            className="text-lg font-semibold tracking-tight text-zinc-100"
                                        >
                                            {title}
                                        </h3>
                                        <div className="mt-3">
                                            <span
                                                lang="en"
                                                dir="ltr"
                                                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] leading-5 ${difficultyStyles[difficulty]}`}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="size-1.5 rounded-full bg-current"
                                                />
                                                {level}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {index === 0 && <DocumentChatPreview />}
                                {index === 1 && <DatabaseAnalystPreview />}
                                {index === 2 && <CustomerSupportPreview />}
                                {index === 3 && <DeepResearchPreview />}
                                {index === 4 && <CodebaseAssistantPreview />}
                                {index === 5 && <ContractIntelligencePreview />}
                                {index === 6 && <WorkflowAutomationPreview />}
                                {index === 7 && <MultiAgentPreview />}
                                <div
                                    className={
                                        index < 8
                                            ? "mt-3 border-t border-white/6 pt-2.5"
                                            : "mt-6 flex-1 border-t border-white/6 pt-4"
                                    }
                                >
                                    <p
                                        className={`${index < 8 ? "mb-1.5" : "mb-3"} text-[9px] font-medium tracking-[0.16em] text-zinc-600 uppercase`}
                                    >
                                        Core concepts
                                    </p>
                                    <ul
                                        aria-label={`${title} concepts`}
                                        className={`flex flex-wrap ${index < 8 ? "gap-1" : "gap-2"}`}
                                    >
                                        {skills.map((skill) => (
                                            <li
                                                key={skill}
                                                className={`rounded-md border border-white/6 bg-white/3 leading-4 text-zinc-400 ${index < 8 ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1.5 text-[11px]"}`}
                                            >
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}
