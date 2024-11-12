import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Calendar, MessageSquare, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dara-navy">Hello! 👋</h1>
            <p className="text-gray-600">How are you? Let's start a session.</p>
          </div>
          <Button className="bg-dara-yellow text-dara-navy hover:bg-dara-navy hover:text-white">
            Start Session
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 card-hover">
            <div className="flex items-center space-x-4">
              <div className="bg-dara-yellow rounded-full p-3">
                <MessageSquare className="h-6 w-6 text-dara-navy" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">3 Sessions</h2>
                <p className="text-gray-600">Keep the streak going!</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 card-hover">
            <div className="flex items-center space-x-4">
              <div className="bg-dara-yellow rounded-full p-3">
                <Calendar className="h-6 w-6 text-dara-navy" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Next Session</h2>
                <p className="text-gray-600">Oct 15, 2024 - 8:00 PM</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 card-hover">
            <div className="flex items-center space-x-4">
              <div className="bg-dara-yellow rounded-full p-3">
                <Sparkles className="h-6 w-6 text-dara-navy" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Wellness Programs</h2>
                <p className="text-gray-600">Discover local resources</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;