import { getSubscribers, getSubscriberCount } from "@/lib/actions/subscribers";
import { SubscribersManager } from "./subscribers-manager";

export default async function AdminSubscribersPage() {
  const [subscribers, activeCount] = await Promise.all([
    getSubscribers(),
    getSubscriberCount(),
  ]);

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <SubscribersManager subscribers={subscribers} activeCount={activeCount} />
    </div>
  );
}
