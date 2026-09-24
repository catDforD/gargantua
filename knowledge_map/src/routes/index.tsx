import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <KnowledgeGraph />;
}
