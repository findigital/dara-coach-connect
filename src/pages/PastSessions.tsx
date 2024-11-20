import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import PastSessions from "@/components/sessions/PastSessions";

const PastSessionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="bg-white border-b">
            <div className="container mx-auto py-4">
              <h1 className="text-2xl font-semibold text-dara-navy">Past Sessions</h1>
            </div>
          </div>
          <div className="container mx-auto p-6">
            <PastSessions />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PastSessionsPage;