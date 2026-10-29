import AgentWorkspace from "@/components/AgentWorkspace";

export default function CustomAgentPage() {
  return (
    <AgentWorkspace
      name="Custom Agent"
      title="Owner-Defined Specialist"
      mission="Create a specialist role with explicit expertise, reporting lines, tools, data access, and permissions without changing Maya's core executive architecture."
      placeholder="Define this specialist's role, expertise, responsibilities, and limits..."
    />
  );
}
