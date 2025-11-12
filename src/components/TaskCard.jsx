export default function TaskCard({ task }) {
  return (
    <div className="bg-white rounded p-2 shadow mb-2 border">
      <h3 className="font-medium">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.assignee?.name}</p>
      <p className="text-xs text-gray-400">{task.status}</p>
    </div>
  );
}
