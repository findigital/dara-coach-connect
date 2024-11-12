import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dara-yellow text-dara-navy py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="font-semibold">Dara</span>
            <Link to="/privacy" className="text-sm text-dara-navy/80 hover:text-dara-navy">Privacy</Link>
            <Link to="/terms" className="text-sm text-dara-navy/80 hover:text-dara-navy">Terms</Link>
          </div>
          <div className="text-sm text-dara-navy/80">
            &copy; {new Date().getFullYear()} Dara. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;