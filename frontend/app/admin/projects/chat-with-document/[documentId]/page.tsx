import DocumentChat from "../_components/DocumentChat";
import { Suspense } from "react";

async function Conversation({ params }: { params: Promise<{ documentId: string }> }) {
    const { documentId } = await params;
    return <DocumentChat key={documentId} documentId={documentId} />;
}

export default function DocumentConversationPage(props: {
    params: Promise<{ documentId: string }>;
}) {
    return (
        <Suspense
            fallback={
                <p role="status" className="text-ui-secondary p-6 text-sm">
                    Loading conversation…
                </p>
            }
        >
            <Conversation {...props} />
        </Suspense>
    );
}
