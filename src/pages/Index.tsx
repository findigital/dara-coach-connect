import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Calendar, MessageSquare, Bell, ClipboardList, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="flex-grow">
          <div className="p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-dara-navy">Hello!</h1>
                  <span role="img" aria-label="waving hand" className="text-3xl wave-animation">👋</span>
                </div>
                <p className="text-gray-600">How are you? Let's start a session.</p>
              </div>
              <Button 
                className="bg-dara-yellow text-dara-navy hover:bg-dara-navy hover:text-white flex items-center gap-2"
              >
                Start Session
                <span className="ml-2">→</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/sessions" className="md:col-span-1">
                <Card className="p-6 card-hover h-[250px] bg-dara-navy text-white cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <MessageSquare className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      <h2 className="text-3xl font-bold mb-2">3 Sessions</h2>
                      <p className="text-gray-300">Keep the streak going!</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <div onClick={() => navigate('/past-sessions')} className="md:col-span-1 cursor-pointer">
                <Card className="p-6 card-hover h-[250px] cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <ClipboardList className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      <h2 className="text-3xl font-bold mb-2 text-dara-navy">2 To-dos</h2>
                      <p className="text-gray-600">Your session notes →</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Link to="/notifications">
                <Card className="p-6 card-hover h-[200px] cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <Bell className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      <h2 className="text-3xl font-bold mb-2 text-dara-navy">1 Notification</h2>
                      <p className="text-gray-600">Stay in contact with Dara →</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/schedule">
                <Card className="p-6 card-hover h-[200px] cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <Calendar className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      <h2 className="text-xl font-bold mb-2 text-dara-navy">Oct 15, 2024</h2>
                      <p className="text-gray-600">8:00 PM</p>
                      <p className="text-gray-600 mt-2">Schedule Session →</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/wellness">
                <Card className="p-6 card-hover h-[200px] cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <Compass className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      <h2 className="text-xl font-bold mb-2 text-dara-navy">Find a Wellness Program</h2>
                      <p className="text-gray-600">Search for Wellness Programs →</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;