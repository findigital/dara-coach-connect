import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const WelcomeHeader = () => {
  const navigate = useNavigate();
  
  return (
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
        onClick={() => navigate('/sessions')}
      >
        Start Session
        <span className="ml-2">→</span>
      </Button>
    </div>
  );
};