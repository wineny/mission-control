import MemoryTimeline from "@/components/MemoryTimeline";

export default function MemoryPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📁 메모리</h1>
      <MemoryTimeline />
    </div>
  );
}
