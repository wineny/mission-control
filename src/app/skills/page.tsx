import SkillsList from "@/components/SkillsList";

export default function SkillsPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 스킬</h1>
      <SkillsList />
    </div>
  );
}
