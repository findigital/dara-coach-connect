import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import { CalendarDays, CheckCircle2, ChevronRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [activeSessionId, setActiveSessionId] = useState(pastSessions[0].id);

  const activeSession = pastSessions.find(session => session.id === activeSessionId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="container mx-auto p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-dara-navy" />
              <h1 className="text-2xl font-bold text-dara-navy">Past Coaching Sessions</h1>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sessions List */}
              <Card className="lg:h-[calc(100vh-8rem)] flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl text-dara-navy">Sessions History</CardTitle>
                  <CardDescription>Review your previous coaching sessions</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 pb-4">
                    {pastSessions.map((session) => (
                      <Card 
                        key={session.id} 
                        className={cn(
                          "cursor-pointer transition-all duration-200 transform hover:translate-x-1 group",
                          activeSessionId === session.id 
                            ? "bg-dara-yellow/10 border-dara-yellow" 
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => setActiveSessionId(session.id)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <CardTitle className={cn(
                                "text-lg transition-colors",
                                activeSessionId === session.id 
                                  ? "text-dara-navy" 
                                  : "text-dara-navy"
                              )}>
                                {session.title}
                              </CardTitle>
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarDays className="h-4 w-4 mr-1" />
                                {new Date(session.date).toLocaleDateString()}
                              </div>
                            </div>
                            <ChevronRight className={cn(
                              "h-5 w-5 transition-colors",
                              activeSessionId === session.id 
                                ? "text-dara-yellow" 
                                : "text-gray-400 group-hover:text-dara-yellow"
                            )} />
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Session Details */}
              <Card className="lg:h-[calc(100vh-8rem)] flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-dara-navy">Session Summary</CardTitle>
                    <Badge variant="outline" className="bg-dara-yellow/10 text-dara-navy border-dara-yellow">
                      Completed
                    </Badge>
                  </div>
                  <CardDescription>Details and action items from your selected session</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-dara-navy">Summary</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {activeSession?.summary}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-dara-navy">Action Items</h3>
                        <ul className="space-y-3">
                          {activeSession?.actionItems.map((item, index) => (
                            <li 
                              key={index} 
                              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
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