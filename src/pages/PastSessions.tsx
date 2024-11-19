import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";

const PastSessions = () => {
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [sessions, setSessions] = useState([
    {
      id: 1,
      date: "2024-02-19",
      title: "Goal Setting Session",
      summary: "Discussed career transition goals and identified key milestones. Focus on developing new skills in project management.",
      actionItems: [
        { id: 1, text: "Research PMP certification requirements", completed: false },
        { id: 2, text: "Create a timeline for skill development", completed: false },
        { id: 3, text: "Schedule informational interviews", completed: false }
      ]
    },
    {
      id: 2,
      date: "2024-02-14",
      title: "Stress Management",
      summary: "Explored current stress triggers and developed coping mechanisms. Emphasis on work-life balance and boundary setting.",
      actionItems: [
        { id: 4, text: "Implement daily meditation practice", completed: false },
        { id: 5, text: "Set up work schedule boundaries", completed: false },
        { id: 6, text: "Create weekly exercise routine", completed: false }
      ]
    }
  ]);
  const { toast } = useToast();

  const activeSession = sessions.find(session => session.id === activeSessionId);

  const handleCheckboxChange = (sessionId: number, actionItemId: number) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            actionItems: session.actionItems.map(item => 
              item.id === actionItemId 
                ? { ...item, completed: !item.completed }
                : item
            )
          };
        }
        return session;
      })
    );

    toast({
      title: "Progress saved",
      description: "Your action item status has been updated.",
    });
  };

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
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sessions List */}
              <Card className="lg:h-[calc(100vh-8rem)] flex flex-col bg-white">
                <CardHeader className="space-y-1">
                  <h2 className="text-xl font-semibold text-dara-navy">Sessions History</h2>
                  <p className="text-sm text-gray-500">Review your previous coaching sessions</p>
                </CardHeader>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 pb-4">
                    {sessions.map((session) => (
                      <Card 
                        key={session.id} 
                        className={cn(
                          "cursor-pointer transition-all duration-200 transform hover:-translate-y-1",
                          activeSessionId === session.id 
                            ? "bg-dara-yellow/10 border-dara-yellow" 
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => setActiveSessionId(session.id)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-dara-navy">
                                {session.title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarDays className="h-4 w-4 mr-1" />
                                {new Date(session.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Session Details */}
              {activeSession && (
                <Card className="lg:h-[calc(100vh-8rem)] flex flex-col bg-white">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-dara-navy">{activeSession.title}</h2>
                      <div className="text-sm text-gray-500">
                        {new Date(activeSession.date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-dara-navy mb-2">Summary</h3>
                          <p className="text-gray-600">{activeSession.summary}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="font-semibold text-dara-navy">Action Items</h3>
                          <div className="space-y-2">
                            {activeSession.actionItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                              >
                                <Checkbox
                                  id={`item-${item.id}`}
                                  checked={item.completed}
                                  onCheckedChange={() => handleCheckboxChange(activeSession.id, item.id)}
                                  className="mt-1"
                                />
                                <label
                                  htmlFor={`item-${item.id}`}
                                  className={cn(
                                    "text-gray-700 cursor-pointer",
                                    item.completed && "line-through text-gray-400"
                                  )}
                                >
                                  {item.text}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PastSessions;