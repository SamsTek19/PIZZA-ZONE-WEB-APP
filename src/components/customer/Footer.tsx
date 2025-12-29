import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="bg-gray-800 rounded-xl p-4 h-64 flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8018749785!2d-0.1870!3d5.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzYnMTMuMyJOIDDCsDExJzEzLjIiVw!5e0!3m2!1sen!2sgh!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '0.75rem' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pizza Zone Location"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-orange-400">About Pizza Zone</h3>
            <p className="text-gray-300 mb-4">
              Ghana's premier destination for authentic pizza, delicious Ghanaian cuisine, and quality continental dishes. We bring the best flavors right to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-orange-400 transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                <Twitter size={24} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-orange-400">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="text-orange-400 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-300">
                  123 Ring Road Central, Accra, Ghana
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-orange-400 flex-shrink-0" size={20} />
                <span className="text-gray-300">+233 24 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-orange-400 flex-shrink-0" size={20} />
                <span className="text-gray-300">info@pizzazone.gh</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="text-orange-400 flex-shrink-0 mt-1" size={20} />
                <div className="text-gray-300">
                  <p>Mon - Sat: 10:00 AM - 11:00 PM</p>
                  <p>Sunday: 12:00 PM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-orange-400">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#menu" className="hover:text-orange-400 transition-colors">Menu</a>
              </li>
              <li>
                <a href="#about" className="hover:text-orange-400 transition-colors">About Us</a>
              </li>
              <li>
                <a href="#delivery" className="hover:text-orange-400 transition-colors">Delivery Areas</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-orange-400 transition-colors">Terms & Conditions</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Pizza Zone. All rights reserved.</p>
          <p className="mt-2 text-sm">Crafted with love in Ghana</p>
        </div>
      </div>
    </footer>
  );
}
