import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import { CalendarDays, CheckCircle2 } from "lucide-react";

// Mock data - replace with actual data fetching
const pastSessions = [
  {
    id: 1,
    date: "2024-02-20",
    title: "Goal Setting Session",
    summary: "Discussed career transition goals and identified key milestones. Focus on developing new skills in project management.",
    actionItems: [
      "Research PMP certification requirements",
      "Create a timeline for skill development",
      "Schedule informational interviews"
    ]
  },
  {
    id: 2,
    date: "2024-02-15",
    title: "Stress Management",
    summary: "Explored current stress triggers and developed coping mechanisms. Emphasis on work-life balance and boundary setting.",
    actionItems: [
      "Implement daily meditation practice",
      "Set up work schedule boundaries",
      "Create weekly exercise routine"
    ]
  }
];

const PastSessions = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Past Coaching Sessions</h1>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sessions List */}
              <Card className="lg:h-[calc(100vh-8rem)] flex flex-col">
                <CardHeader>
                  <CardTitle>Sessions History</CardTitle>
                  <CardDescription>Review your previous coaching sessions</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 pb-4">
                    {pastSessions.map((session) => (
                      <Card 
                        key={session.id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{session.title}</CardTitle>
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarDays className="h-4 w-4 mr-1" />
                              {new Date(session.date).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Session Details */}
              <Card className="lg:h-[calc(100vh-8rem)] flex flex-col">
                <CardHeader>
                  <CardTitle>Session Summary</CardTitle>
                  <CardDescription>Details and action items from your selected session</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2">Summary</h3>
                        <p className="text-gray-600">{pastSessions[0].summary}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Action Items</h3>
                        <ul className="space-y-2">
                          {pastSessions[0].actionItems.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PastSessions;