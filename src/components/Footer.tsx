import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dara-navy text-white mt-16 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Dara</h3>
            <p className="text-gray-300">Empowering mental wellness through technology.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-300 hover:text-dara-yellow">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-300 hover:text-dara-yellow">Pricing</Link></li>
              <li><Link to="/wellness" className="text-gray-300 hover:text-dara-yellow">Wellness Programs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-dara-yellow">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-dara-yellow">Contact</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-dara-yellow">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-300 hover:text-dara-yellow">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-dara-yellow">Terms of Service</Link></li>
              <li><Link to="/security" className="text-gray-300 hover:text-dara-yellow">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Dara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;